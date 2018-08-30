import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FirebaseService } from '../core/services/firebase.service';
import { DataService } from '../core/services/data.service';
import { Subject } from 'rxjs';


// See https://github.com/angular/angular-cli/issues/10170#issuecomment-380673276
//  @stefanzvonar commented on Jun 19
// However, if you want to provide a service in any feature module (not the root), then 
// you are better off using the providers array in the feature module's decorators, otherwise
//  you will be plagued with circular dependency warnings.

// @Injectable({
//   //providedIn: RecordModule
// })

@Injectable()
export class RecordService {

  public theForm: FormGroup;
  public isUpdating: boolean = false;
  public isUpdating$ = new Subject<boolean>();
  public currentRecordId$ = new Subject<string>();

  constructor(private fs: FirebaseService, private fb: FormBuilder, private dataService: DataService) { }

  public setForm(form) {
    this.theForm = form;
  }

  get phoneFormsFather() {
    return this.theForm.get('fatherPhones') as FormArray;
  }

  get phoneFormsMother() {
    return this.theForm.get('motherPhones') as FormArray;
  }

  get childrenForms() {
    return this.theForm.get('children') as FormArray;
  }

  public prepFormToUpdate(record) {
    this.isUpdating$.next(true);
    // Get the id of the document being editied so we know 
    // which doc to update in the submitHandler method
    this.currentRecordId$.next(record.realId);
    // Populate the form with record being edited
    this.theForm.patchValue({
      surname: record.surname,
      fatherFname: record.fatherFname,
      fatherLname: record.fatherLname,
      fatherEmail: record.fatherEmail,
      motherEmail: record.motherEmail,
      district: record.district,
      catholic: record.catholic
    });


      const fp = this.dataService.convertMapToArray(record.fatherPhones);
      fp.forEach((p) => {
        const _fPhone = this.fb.group({
          number:p.number,
          type: p.type
        })
        this.phoneFormsFather.push(_fPhone);
      });

      const mp = this.dataService.convertMapToArray(record.motherPhones);
      mp.forEach((p) => {
        const _phone = this.fb.group({
          number:p.number,
          type: p.type
        })
        this.phoneFormsFather.push(_phone);
      });


    const children = this.dataService.convertMapToArray(record.children);
    children.forEach((child) => {
      const _child = this.fb.group({
        fname: child.fname,
        lname: child.lname,
        grade: child.grade,
        gender: child.gender,
        race: child.race,
        id: child.id
      })
      this.childrenForms.push(_child);
    });

  }

  public deleteRecord(record) {
    this.fs.recordCollection.doc(record.realId).delete()
      .then(_ => console.log("removed from DB"));
  }

}
