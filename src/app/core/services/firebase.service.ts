import { Injectable } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject} from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';

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

  constructor(private afs: AngularFirestore) {

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

}
