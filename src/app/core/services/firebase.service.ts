import { Injectable } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject} from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';
import { DataService } from './data.service';
//import * as firebase from 'firebase/app';

import * as firebase from 'firebase';
import 'firebase/firestore';

// import * as functions from "../../../../functions/src/index";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  public recordCollection: AngularFirestoreCollection<any[]>;
  public records$: Observable<any[]>;

  public financialsCollection: AngularFirestoreCollection<any[]>;
  public financials$: Observable<any[]>;

  public studentsCollection: AngularFirestoreCollection<any[]>;

  // app.component sets this value to determine if show prog spinner.  See login component
  public loading = new Subject<boolean>();

  constructor(private afs: AngularFirestore, private dataService: DataService) {

    this.loading.next(false);

    this.recordCollection = this.afs.collection<any[]>('records');
    this.records$ = this.mapAndReplayCollection(this.recordCollection);

    this.financialsCollection = this.afs.collection<any[]>('financials');

    this.studentsCollection = this.afs.collection<any[]>('students');

  }
  private mapAndReplayCollection(collection: AngularFirestoreCollection<any[]>): any {
    return collection.snapshotChanges()
      .pipe(
        tap((arr => console.log(`${arr.length} reads on ${collection.ref.id} collection `))),
        map(changes => {
          return changes.map(a => {
            return { realId: a.payload.doc.id, ...a.payload.doc.data() }
          });
        }),
       shareReplay(1) // Apparently a bug with shareReplay() causes <observable>$ to not unsubscribe despite unsubscribing.
      );
  }

  public closeOutYear () {
    const message = { message: 'Hello.' };

    firebase.functions().httpsCallable('myFunction')(message)
      .then(result => {
				console.log(`MD: FirebaseService -> publiccloseOutYear -> result`, result);
        // Do something //
      })
      .catch(error => {
        // Error handler //
      });

    this.recordCollection.ref.get()
      .then(records => {
        records.forEach(record => {
          const children = this.dataService.convertMapToArray(record.data().children);
          let newGrade = '';
          return this.afs.firestore.runTransaction(async transaction =>  {
            // This code may get re-run multiple times if there are conflicts.
            const r = await transaction.get(record.ref);
            if (!r.exists) {
              throw new Error('Document does not exist!');
            }
            children.forEach(child => {
              newGrade = this.processGradeLevel(child);
              if ( ![`children.${child.id}.grade`]) {throw new Error();}
              transaction.update(record.ref, { [`children.${child.id}.grade`]: newGrade });
              console.log('Running transaction. Processing record id: ', record.ref.id);
            });
          }).then(() => {
              console.log(`Transaction ${record.ref.id} in record collection successfully committed!`);
              record.ref.update({closeOutError: firebase.firestore.FieldValue.delete()});
          }).catch(error => {
              console.log(`Transaction failed for record ${record.data().childFirstName} ${record.data().childLastName}: ${error}`);
              record.ref.update({closeOutError: `${error}`});
          });
        });
      });
      // ----Financials Collection ---
      this.financialsCollection.ref.get()
      .then(docs => {
        docs.forEach(doc => {
          let newGrade = '';
          return this.afs.firestore.runTransaction(async transaction =>  {
            // This code may get re-run multiple times if there are conflicts.
            const d = await transaction.get(doc.ref);
            if (!d.exists) {
              throw new Error('Document does not exist!');
            }
            newGrade = this.processGradeLevel(doc.data());
            const today = new Date();
            const currentYear = today.getFullYear();
            const lastYear = today.getFullYear() - 1;
            transaction.update(doc.ref, {
              grade: newGrade,
              // Create a historical record of the current tuition balance, for example,
              // tuition2018-2019StartingBalance: XXXX
              [`tuition${lastYear}-${currentYear}StartingBalance`]: doc.data().tuitionStartingBalance,
              // Whatever date as used as the tuitionStatartingBalance date will become the historical date.
              [`tuition${lastYear}-${currentYear}StartingBalanceDate`]: doc.data().tuitionStartingBalanceDate,
              // The stating balance changes to the current (running) balance.
              tuitionStartingBalance: doc.data().tuitionBalance,
              tuitionStartingBalanceDate: new Date(),
            });
          }).then(() => {
              console.log(`Transaction for financial doc ${doc.ref.id} successfully committed!`);
              doc.ref.update({closeOutError: firebase.firestore.FieldValue.delete()});
          }).catch(error => {
               doc.ref.update({closeOutError: `${error}`});
          });
        });
      });
  }

  private processGradeLevel (item): string {
    let newGrade = '';
    let incrementedGrade: number;
    if (item.grade === 'PK3') {
      newGrade = 'PK4';
   } else if (item.grade === 'PK4') {
      newGrade = 'K';
   } else if (item.grade === 'K') {
     newGrade = '1';
   } else {
      incrementedGrade = parseInt(item.grade, 10) + 1;
      newGrade = incrementedGrade.toString();
   }
    return newGrade;
  }

}
