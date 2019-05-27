import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})

export class DataService {

 // public currentRecord: any;
 public currentRecord$ = new BehaviorSubject<any>(null);

  constructor() { }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentRecord(record) {
    this.currentRecord$.next(record);
  }


  // public syncFinancialDocs(record, currentRecordId) {
  //   const children = this.convertMapToArray(record.children);
  //   children.forEach(child => {
  //     this.fs.financialsCollection.doc(child.id)
  //       .set({
  //         recordId: currentRecordId,
  //         // In the beginning, email properties and child's grade level did not exist on the financial doc. 
  //         // This will ensure that these properties from the currentRecord are copied over and stay in sync.
  //         fatherEmail: record.fatherEmail,
  //         motherEmail: record.motherEmail,
  //         // Create / sync other child info.  Note: grade property added on 3/18/19.
  //         childFirstName: child.fname,
  //         childLastName: child.lname,
  //         grade: record.children[child.id].grade,
  //       },  { merge: true })
  //         .then(_ => {});
  //   });
  // }

}
