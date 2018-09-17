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

  //private financialDocs: any[] = [];

  constructor(private firebaseService: FirebaseService) {

    this.firebaseService.financials$.subscribe(docs => {
      docs.forEach(doc => {
        // console.log('TCL: DataService -> constructor -> doc', doc);
        // this.financialDocs.push(doc);
      });
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

    // Possible issue: every time the financials button is clicked in child-table, a read is being executed on currentFinancialDoc.
    
    // Array populated from subscription.  Grab doc from array based on id. - What about the first time where there aren't any docs present?
    
    // this.financialDocs.forEach(doc =>{  
    //  // console.log(`financialDocs.forEach -> doc: ${doc.ref}`);
    //   console.log(Object.values(doc));
    // })

    this.currentFinancialDoc = this.firebaseService.financialsCollection.doc(id); // do this if no docs
    console.log('TCL: publiccreateFinancialDoc -> this.currentFinancialDoc', this.currentFinancialDoc);

    this.currentFinancialDoc.ref.get().then(snapshot => {
      if (!snapshot.exists) {
        this.currentFinancialDoc.set({ dateCreated: new Date });
      }
    });

  }

}