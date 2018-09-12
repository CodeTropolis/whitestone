import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';


// export interface Record {
//   id: any;
//   surname:string; 
//   username: string;
//   email: string;
//   //children: Child[];
//   children: any[];
// }

// export interface Child {
//   fname: string;
//   lname: string;
//   grade: number;
// }

// export interface Financial {
//   tuition: number;
//   lunch?: number;
//   extraCare?: number;
//   misc?: number;
// }

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  public recordCollection: AngularFirestoreCollection<any[]>;
  public records$: Observable<any[]>;

  public financialsCollection: AngularFirestoreCollection<any[]>;
 // public financials$: Observable<any[]>;

  // app.component sets this value to determine if show prog spinner.  See login component
  public loading = new Subject<boolean>();

  constructor(private db: AngularFirestore) {

    this.loading.next(false);

    this.recordCollection = this.db.collection<any[]>('records');
    this.records$ = this.recordCollection.snapshotChanges()
      .pipe(map(changes => changes.map(a => ({ realId: a.payload.doc.id, ...a.payload.doc.data() })))); // Implicit return - why wrap in ()s?
    // Answer:
    // https://stackoverflow.com/a/45003736
    // The problem arises when you want to implicitly return an object literal. 
    // You can't use ( … ) => { … } because it'll be interpreted as a block. The solution is to use parentheses.

    this.financialsCollection = this.db.collection<any[]>('financials');

    this.financialsCollection.valueChanges().pipe(tap(arr => console.log(`read ${arr.length} docs`)))

    // this.financials$ = this.financialsCollection.valueChanges().pipe(tap(arr => console.log(`read ${arr.length} docs`)))

    // this.financials$ = this.financialsCollection.snapshotChanges()
    //   .pipe(
    //     map(actions => actions.map(a => {
    //       const data = a.payload.doc.data() as any;
    //       const realId = a.payload.doc.id;
    //       return { realId, ...data };
    //     }))
    //   );

  }

}
