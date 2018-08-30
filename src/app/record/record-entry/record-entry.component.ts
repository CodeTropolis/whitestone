import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FirebaseService } from '../../core/services/firebase.service';
import { RecordService } from '../record.service';

import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-record-entry',
  templateUrl: './record-entry.component.html',
  styleUrls: ['./record-entry.component.css']
})
export class RecordEntryComponent implements OnInit {

  public myForm: FormGroup;
  private currentRecordId: any;
  public currentUser$: Observable<any>;
  public isUpdating: boolean = false;

  private isUpdatingSubscription: any;
  private currentIdSubscription: any;

  //public submitted = false;

  public races: any[] = [
    { value: 'african-american', display: 'African-American' },
    { value: 'asian', display: 'Asain' },
    { value: 'caucasian', display: 'Caucasian' },
    { value: 'mixed', display: 'Mixed' },
    { value: 'pacific-islander', display: 'Pacific Islander' },
    { value: 'native-american', display: 'Native American' },
    { value: 'unknown', display: 'Unknown' }
  ]

  public gender: any[] = [
    { value: 'male', display: 'Male' },
    { value: 'female', display: 'Female' },
  ]

  public catholic: any[] = [
    // value is Catholic in order to filter table by 'Catholic' versus
    // filtering by 'yes' or 'no'.  There may be other Yes/No options in the future.
    { value: 'Catholic', display: 'Yes' },
    { value: 'No', display: 'No' },
  ]

  constructor(
    private rs: RecordService,
    private fs: FirebaseService,
    private fb: FormBuilder,
    private authService: AuthService,
    private afs: AngularFirestore) { }

  ngOnInit() {

    this.myForm = this.fb.group({
      surname: ['', Validators.required],
      father: [''],
      mother: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      phone: this.fb.array([]),
      email: ['', [Validators.required, Validators.email]],
      secondaryEmail: ['', [Validators.email]],
      district: ['', Validators.required],
      catholic: ['', Validators.required],
      children: this.fb.array([]),
    })
    // Get a reference to this form so that operations can 
    // be performed on the form in the record-entry.service
    this.rs.theForm = this.myForm;
    // State of isUpdated set by the service
    this.isUpdatingSubscription = this.rs.isUpdating$.subscribe(x => this.isUpdating = x);
    // Subscribe to the currentId$ subject so that it is available to submit handler
    this.currentIdSubscription = this.rs.currentRecordId$.subscribe(x => this.currentRecordId = x);
    // Get the current user from the service and set to async in view
    this.currentUser$ = this.authService.authState;

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.myForm.controls;
  }

  get phoneForms() {
    return this.myForm.get('phone') as FormArray;
  }

  get childrenForms() {
    return this.myForm.get('children') as FormArray;
  }

  addPhone() {
    const child = this.fb.group({
      number: ['', Validators.required],
      type: ['', Validators.required],
    })
    this.phoneForms.push(child);
  }

  deletePhone(i) {
    this.phoneForms.removeAt(i);
  }

  addChild() {

    const child = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      grade: ['', Validators.required],
      gender: ['', Validators.required],
      race: ['', Validators.required],
      id: ['']
    })
    this.childrenForms.push(child);
  }

  deleteChild(i) {
    this.childrenForms.removeAt(i);
  }

  async submitHandler(formDirective) {

    if (this.myForm.invalid) { return; }

    const formValue = this.myForm.value;

    const data = {
      ...formValue,
      children: this.convertArrayToMapWithUUid(formValue.children)
    }

    // I guess my confusion is that the`children` key itself is not submitted to DB twice… 
    // chris[10: 09 PM]
    // yes, children should not be written twice because the line of 
    // code: children: this.......will overwrite the previous value of 
    // children like you mentioned, but you could always check the db to make sure it isnt appearing twice

    if (!this.isUpdating) {
      try {
        // Add a new record
        await this.fs.recordCollection.add(data)
          .then(() => {
            this.resetForm(formDirective);
          });
      } catch (err) {
        console.log(err);
      }
    }
    if (this.isUpdating) {
      try {
        // Update current record
        await this.fs.recordCollection.doc(this.currentRecordId).update(data) 
          .then(() => {
            this.rs.isUpdating$.next(false);
            this.resetForm(formDirective);
          });
      } catch (err) {
        console.log(err);
      }
    }
  }

  private convertArrayToMapWithUUid(arr: any[]) {
    const map = {};
    arr.forEach(obj => {
      const uuid = obj.id || this.afs.createId();
       obj.id = uuid;
      map[`${uuid}`] = obj;
    })
    return map
  }

  public cancel(formDirective) {
    this.rs.isUpdating$.next(false);
    this.resetForm(formDirective);
  }

  private resetForm(formDirective) {
    //this.submitted = false;
    formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.myForm.reset();
    this.myForm.setControl('children', this.fb.array([]));
  }

  public logOut() {
    this.authService.logOut('');
  }

  ngOnDestroy() {
    this.isUpdatingSubscription.unsubscribe();
    this.currentIdSubscription.unsubscribe();
  }
}