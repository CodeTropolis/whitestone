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

  public closeOutYearRunning$ = new Subject<boolean>();

  constructor(private afs: AngularFirestore, private dataService: DataService) {

    this.loading.next(false);
    this.closeOutYearRunning$.next(false);

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
            return { realId: a.payload.doc.id, ...a.payload.doc.data() };
          });
        }),
       shareReplay(1) // Apparently a bug with shareReplay() causes <observable>$ to not unsubscribe despite unsubscribing.
      );
  }

  // fixDate: Upon restoring database using firestore-migrate, date gets converted to nanoseconds and seconds.
  public fixDate () {
    this.recordCollection.ref.get()
    .then(records => {
      records.forEach(record => {
        const children = this.dataService.convertMapToArray(record.data().children);
        children.forEach(child => {
          if (child.dob._seconds){
            const nDate = (new Date(child.dob._seconds * 1000)).toUTCString();
            console.log(`Child: ${child.fname} ${child.lname}, DOB: ${nDate}`);
            //record.ref.update({[`children.${child.id}.dob`]: nDate});
          }
        });
      });
    });

    this.financialsCollection.ref.get()
    .then(docs => {
      docs.forEach(doc => {
        console.log(`MD: FirebaseService -> fixDate -> doc.data().dateCreated`, doc.data().dateCreated);
        if (doc.data().dateCreated) {
          // Why do we need dateCreated?
          // const dateCreated = (new Date(doc.data().dateCreated._seconds * 1000)).toUTCString();
          // console.log(`MD: FirebaseService -> fixDate -> dateCreated`, dateCreated);
          // doc.ref.update({dateCreated: dateCreated});
          doc.ref.update({dateCreated: firebase.firestore.FieldValue.delete()});
        }

        const arr = ['tuition', 'lunch', 'extendedCare', 'misc'];
        arr.forEach(element => {
          if ([`${element}StartingBalanceDate`]) {
            doc.ref.update({[`${element}StartingBalanceDate`]: firebase.firestore.FieldValue.delete()});
            // const key = [`${element}StartingBalanceDate`];
            // const formatDate = (new Date([`${element}StartingBalanceDate`]._seconds * 1000)).toUTCString();
            // console.log(`MD: FirebaseService -> fixDate -> formatDate`, formatDate);
          }
        });
      });
    });

  }

  public closeOutYear () {
    this.closeOutYearRunning$.next(true);
    const today = new Date();
    // const currentYear = today.getFullYear();
    const currentYear = today.getFullYear();
    const lastYear = today.getFullYear() - 1;
    // Close out for previous year should always be executed one year ahead.
    // For example, closing out the 2018 school year should only occur in 2019.
    const closeOutErrKey = [`closeOut${lastYear}Errors`];

    this.recordCollection.ref.get()
      .then(records => {
        records.forEach(record => {
          // firebase.functions().httpsCallable('updateDoc')(record)
          //   .then(result => {
          //     console.log(`MD: FirebaseService -> httpsCallable('updateDoc') -> result`, result);
          //     // Do something //
          //   })
          //   .catch(error => {
          //     // Error handler //
          //   });
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
              transaction.update(record.ref, {[`children.${child.id}.grade`]: newGrade });
              console.log('Running transaction. Processing record id: ', record.ref.id);
            });
          }).then(() => {
              console.log(`Transaction ${record.ref.id} in record collection successfully committed!`);
              record.ref.update({[`${closeOutErrKey}`]: firebase.firestore.FieldValue.delete()});
          }).catch(error => {
              console.log(`Transaction failed for record ${record.data().childFirstName} ${record.data().childLastName}: ${error}`);
              record.ref.update({[`${closeOutErrKey}`]: `${error}`});
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
            // Transactions are supposed rerun if a doc changes via another user during execution.
            const d = await transaction.get(doc.ref);
            if (!d.exists) {
              throw new Error('Document does not exist!');
            }
            newGrade = this.processGradeLevel(doc.data());

            transaction.update(doc.ref, {
              grade: newGrade,
            });

            const arr = ['tuition', 'lunch', 'extendedCare', 'misc'];
            const errArr: any[] = [];
            arr.forEach(element => {
              if (doc.data()[`${element}StartingBalance`] || doc.data()[`${element}StartingBalance`] === 0 ) {
                transaction.update(doc.ref, {
                  // Create a historical record of the iterated category balance, for example,
                  // tuition2018StartingBalance: XXXX
                  [`${element}${lastYear}StartingBalance`]: doc.data()[`${element}StartingBalance`],

                  // Whatever date as used as the original <category>StatartingBalance date will become the historical date.
                  // UPDATE: Should not need a specific date - just a historical ref to the original starting balance.
                  // [`${element}${lastYear}StartingBalanceDate`]: doc.data()[`${element}StartingBalanceDate`],

                  // The stating balance changes to the current (running) balance.
                  [`${element}StartingBalance`]: doc.data()[`${element}Balance`],

                  // Should not need this.  When close out year is run in 2020, the starting balance for 2019 will get the historical ref.
                  // [`${element}StartingBalanceDate`]: today,
                });
              } else {
                errArr.push([`${element}StartingBalance not present`]);
                const errObj = Object.assign({}, errArr);
                transaction.update(doc.ref, {[`${closeOutErrKey}`]: errObj});
                // console.log(`MD: FirebaseService -> closeOutYear -> doc.data()`, doc.data());
                // doc.ref.update({closeOutError: `${element}StartingBalance not present`});
              }
            });
          }).then(() => {
              // console.log(`Transaction for financial doc ${doc.ref.id} successfully committed!`);
              // doc.ref.update({closeOutError: firebase.firestore.FieldValue.delete()});
          })
          .catch(error => {
               doc.ref.update({closeOutErrKey: `${error}`});
          });
        });
      }).then( () => {
        this.closeOutYearRunning$.next(false);
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
