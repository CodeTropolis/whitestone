import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FirebaseService } from './firebase.service';
import { DataService } from './data.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  public theForm: FormGroup;
  public isUpdating: boolean = false;
  public isUpdating$ = new Subject<boolean>();
  public currentRecordId$ = new Subject<string>();

  constructor(private fs: FirebaseService, private fb: FormBuilder, private dataService: DataService) { }

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
    // Get the id of the document being edited so we know 
    // which doc to update in the submitHandler method
    this.currentRecordId$.next(record.realId);
    // Populate the form with record being edited
    this.theForm.patchValue({
      surname: record.surname,
      address: record.address,
      city: record.city,
      state: record.state,
      zip: record.zip,
      fatherFname: record.fatherFname,
      fatherLname: record.fatherLname,
      fatherEmail: record.fatherEmail,
      motherFname: record.motherFname,
      motherLname: record.motherLname,
      motherEmail: record.motherEmail,
      district: record.district,
      catholic: record.catholic
    });


    const fp = this.dataService.convertMapToArray(record.fatherPhones);
    fp.forEach((p) => {
      const phone = this.fb.group({
        number: p.number,
        type: p.type
      })
      this.phoneFormsFather.push(phone);
    });

    const mp = this.dataService.convertMapToArray(record.motherPhones);
    mp.forEach((p) => {
      const phone = this.fb.group({
        number: p.number,
        type: p.type
      })
      this.phoneFormsMother.push(phone);
    });


    const children = this.dataService.convertMapToArray(record.children);
    children.forEach((child) => {

      // Need to convert date in order to show dob in form upon record update.
      
      // https://stackoverflow.com/a/847196
      // Create a new JavaScript Date object based on the timestamp
      // multiplied by 1000 so that the argument is in milliseconds, not seconds.
      const timestamp = child.dob.seconds;
      const date = new Date(timestamp * 1000);

      const _child = this.fb.group({
        fname: child.fname,
        lname: child.lname,
        dob: date,
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
