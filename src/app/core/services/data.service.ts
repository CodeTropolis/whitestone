// data.service for methods used across modules i.e. child.table from record module uses setCurrentChild() and createFinancialRecord()

import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  public currentFinancialDoc$ = new BehaviorSubject<any>(null);
  public currentChild$ = new BehaviorSubject<any>(null);
  
  public currentFinancialDoc: any;
  public currentRecord: any;

  constructor(private firebaseService: FirebaseService) {

    this.currentFinancialDoc$.subscribe(payload => {
      this.currentFinancialDoc = payload;
    })
  }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentChild(child){
    this.currentChild$.next(child);
  }

  public createFinancialRecord(id) {
    this.currentFinancialDoc$.next(this.firebaseService.financialsCollection.doc(id));
    this.currentFinancialDoc.ref.get().then((snapshot) => {
      if (!snapshot.exists) {
        this.currentFinancialDoc.set({ dateCreated: new Date });
      }
    });
  }

}