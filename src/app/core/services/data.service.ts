// data.service for methods used across modules i.e. child.table from record module uses setCurrentChild() and createFinancialRecord()

import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  public currentChild$ = new BehaviorSubject<any>(null);

  public currentFinancialDoc: any; //Set in child-table.component.  financials/entry and history will get this upon init
  public currentRecord: any;

  constructor(private firebaseService: FirebaseService) {

    this.firebaseService.financials$.subscribe(docs => {
      // docs.forEach(doc => {

      // });
    });

   }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentChild(child) {
    this.currentChild$.next(child); // Another UI may select other child
  }

  // Creates the base doc for all the child's financials
  public createFinancialDoc(id) {
    this.currentFinancialDoc = this.firebaseService.financialsCollection.doc(id); 
    console.log('TCL: publiccreateFinancialDoc -> this.currentFinancialDoc.ref.id', this.currentFinancialDoc.ref.id);
    this.currentFinancialDoc.ref.get().then(snapshot => {
      if (!snapshot.exists) {
        this.currentFinancialDoc.set({ dateCreated: new Date });
      }
    });

  }

}