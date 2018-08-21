import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public currentFinancialDoc: any;
  public currentRecord: any;
  public currentChild: any;

  public category$ = new BehaviorSubject<any>(null);
  public paymentsCollection$ = new BehaviorSubject<any>(null);
  public deductionsCollection$ = new BehaviorSubject<any>(null);

  constructor(private fs: FirebaseService) { }

  public createFinancialRecord(child) {
    this.currentFinancialDoc = this.fs.financialsCollection.doc(child.id);
    this.currentFinancialDoc.ref.get().then((snapshot) => {
      if (!snapshot.exists) {
        this.currentFinancialDoc.set({ dateCreated: new Date });
      }
    });

    this.currentChild = child;
  }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

}
