import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
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

  // app.component sets this value to determine if show prog spinner.  See login component
  public loading = new Subject<boolean>();

  constructor(private db: AngularFirestore) {

    this.loading.next(false);

    this.recordCollection = this.db.collection<any[]>('records');
    this.records$ = this.recordCollection.snapshotChanges()
      .pipe(map(changes => changes.map(a => ({ realId: a.payload.doc.id, ...a.payload.doc.data() }))), shareReplay(1)); 

    // Added financials$ observable property and shareReplay in an attempt to reduce DB read counts.  
    // Subcribed to in data.service.ts.  Effect Unproven.
    this.financialsCollection = this.db.collection<any[]>('financials');
    this.financials$ = this.financialsCollection.snapshotChanges().pipe(shareReplay(1));
    
  }

}
