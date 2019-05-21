import { Injectable } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject} from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';
import { DataService } from './data.service';

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

  // private updateGradeLevel(){
  //   return this.afs.firestore.runTransaction()
  // }

  private mapAndReplayCollection(collection: AngularFirestoreCollection<any[]>): any {
    return collection.snapshotChanges()
      .pipe(
        tap((arr => console.log(`${arr.length} reads on ${collection.ref.id} collection `))),
        map(changes => {
          return changes.map(a => {
            return { realId: a.payload.doc.id, ...a.payload.doc.data() }
          })
        }),
       shareReplay(1) // Apparently a bug with shareReplay() causes <observable>$ to not unsubscribe despite unsubscribing.
      )
  }

  public closeOutYear () {
    this.recordCollection.ref.get()
      .then(records => {
        records.forEach(record => {
          const children = this.dataService.convertMapToArray(record.data().children);
          let incrementedGrade: any;
          let newGrade: string;
          return this.afs.firestore.runTransaction(transaction =>  {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(record.ref).then(record => {
              if (!record.exists) {
                  throw "Document does not exist!";
              }             
              children.forEach(child => {
                if (child.grade === 'PK3'){
                   newGrade = 'PK4'
                }else if (child.grade === 'PK4'){
                   newGrade = 'K';
                } else if (child.grade === 'K') {
                  newGrade = '1'
                } else {
                   incrementedGrade = parseInt(child.grade, 10) + 1;
                   newGrade = incrementedGrade.toString();
                } 
                transaction.update(record.ref, { [`children.${child.id}.grade`]: newGrade });
                console.log('Running transaction. Processing record id: ', record.ref.id)
              });
            });
          }).then(() => {
              console.log(`Transaction for ${record.ref.id} successfully committed!`);
          }).catch(error =>{
              console.log("Transaction failed: ", error);
          });
        });
      });

      // ---- Update grade level in each doc in financials collection ---
      this.financialsCollection.ref.get()
      .then(docs => {
        docs.forEach(doc => {
          // const children = this.dataService.convertMapToArray(record.data().children);
          let incrementedGrade: any;
          let newGrade: string;
          return this.afs.firestore.runTransaction(transaction =>  {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(doc.ref).then(doc => {
              if (!doc.exists) {
                  throw "Document does not exist!";
              } 
              
            const docGrade = doc.data().grade;
              
            if (docGrade === 'PK3'){
                newGrade = 'PK4'
            }else if (docGrade === 'PK4'){
                newGrade = 'K';
            } else if (docGrade === 'K') {
              newGrade = '1'
            } else {
                incrementedGrade = parseInt(docGrade, 10) + 1;
                newGrade = incrementedGrade.toString();
            } 

            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            //const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            const month = today.toLocaleString('en-us', { month: 'long' });
            const currentYear = today.getFullYear();
            const lastYear = today.getFullYear() -1 ;
            // const nextYear = today.getFullYear() + 1;

            //const nToday = mm + '/' + dd + '/' + currentYear;
            // Save date as time stamp
            const formattedToday = month+' '+dd+', '+currentYear
            
            transaction.update(doc.ref, { 
              grade: newGrade, 
              // Make a record of the current tuition balance, for example,
              // tuition2018-2019StartingBalance: XXXX
              [`tuition${lastYear}-${currentYear}StartingBalance`]: doc.data().tuitionStartingBalance,
              // Whatever date as used as the tuitionStatartingBalance date will become the historical date i.e.
              // tuition2018-2019StartingBalanceDate
              [`tuition${lastYear}-${currentYear}StartingBalanceDate`]: doc.data().tuitionStartingBalanceDate,
              tuitionStartingBalance: doc.data().tuitionBalance, // The stating balance changes to the current (running) balance.
              tuitionStartingBalanceDate: formattedToday, 
            });
            console.log('Processing financial doc id: ', doc.ref.id)
              
            });
          }).then(() => {
              console.log(`Transaction for financial doc ${doc.ref.id} successfully committed!`);
          }).catch(error =>{
              console.log("Transaction failed: ", error);
          });
        });
      });
  }

}
