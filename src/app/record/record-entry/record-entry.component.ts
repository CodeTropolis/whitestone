import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { FirebaseService } from '../../core/services/firebase.service';
import { RecordService } from '../record.service';
import { DataService } from '../../core/services/data.service';

import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

// import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFirestore} from '@angular/fire/firestore';

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

  private subscriptions: any[] = [];

  // private isUpdatingSubscription: any;
  // private currentIdSubscription: any;

  public phoneTypes: any[] = [
    { value: 'home', display: 'Home' },
    { value: 'mobile', display: 'Mobile' },
    { value: 'office', display: 'Office' },
    { value: 'other', display: 'Other' }
  ]

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
    private dataService: DataService,
    private fs: FirebaseService,
    private fb: FormBuilder,
    private authService: AuthService,
    private afs: AngularFirestore) { }

  ngOnInit() {

    this.myForm = this.fb.group({
      surname: ['', Validators.required],
      fatherFname: [''],
      fatherLname: [''],
      fatherEmail: [''],
      fatherPhones: this.fb.array([]),
      motherFname: [''],
      motherLname: [''],
      motherEmail: [''],
      motherPhones: this.fb.array([]),
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      district: ['', Validators.required],
      catholic: ['', Validators.required],
      children: this.fb.array([]),
    })
    // Get a reference to this form so that operations can 
    // be performed on the form in the record-entry.service
    this.rs.theForm = this.myForm;
    // State of isUpdated set by the service
    this.subscriptions.push(this.rs.isUpdating$.subscribe(x => this.isUpdating = x));
    // Subscribe to the currentId$ subject so that it is available to submit handler
    this.subscriptions.push(this.rs.currentRecordId$.subscribe(x => this.currentRecordId = x));
    // Get the current user from the service and set to async in view
    this.currentUser$ = this.authService.authState;

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.myForm.controls;
  }

  get phoneFormFather() {
    return this.myForm.get('fatherPhones') as FormArray;
  }

  addPhoneFather() {
    const phone = this.fb.group({
      number: ['', Validators.required],
      type: ['', Validators.required],
    })
    this.phoneFormFather.push(phone);
  }

  deletePhoneFather(i) {
    this.phoneFormFather.removeAt(i);
  }

  get phoneFormMother() {
    return this.myForm.get('motherPhones') as FormArray;
  }

  addPhoneMother() {
    const phone = this.fb.group({
      number: ['', Validators.required],
      type: ['', Validators.required],
    })
    this.phoneFormMother.push(phone);
  }

  deletePhoneMother(i) {
    this.phoneFormMother.removeAt(i);
  }

  get childrenForm() {
    return this.myForm.get('children') as FormArray;
  }

  addChild() {
    const child = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      dob: ['', Validators.required],
      grade: ['', Validators.required],
      gender: ['', Validators.required],
      race: ['', Validators.required],
      id: ['']
    })
    this.childrenForm.push(child,);
  }

  deleteChild(i) {
    this.childrenForm.removeAt(i);
  }

   submitHandler(formDirective) {

    if (this.myForm.invalid) { return; }

    const formValue = this.myForm.value;

    const data = {
      ...formValue,
      fatherPhones: this.convertArrayToMapWithUUid(formValue.fatherPhones),
      motherPhones: this.convertArrayToMapWithUUid(formValue.motherPhones),
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
         this.fs.recordCollection.add(data)
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
         this.fs.recordCollection.doc(this.currentRecordId).update(data) 
          .then(() => {

            this.rs.isUpdating$.next(false);

            this.resetForm(formDirective);

            let currentRecord: any;

            // Subscription A:
            this.subscriptions.push(  
              this.fs.recordCollection.doc(this.currentRecordId).valueChanges()
                .subscribe(doc =>{
                //console.log(doc);
                currentRecord = doc; // Use properties from doc to update docs obtained from studentDocsToUpdate query
                })
            )

            // Query the students collection based on the currentRecordId and update each doc accordingly
            // ToDo: Make this a Cloud Function.
            const studentDocsToUpdate = this.afs.collection("students", ref => ref.where("recordId","==", this.currentRecordId));
           
            // Subscription B:
            this.subscriptions.push( 
                studentDocsToUpdate.snapshotChanges().subscribe(actions =>{  
                actions.forEach(action => {                                        
                  this.afs.collection("students").doc(action.payload.doc.id).update({
                    dob: currentRecord.children[action.payload.doc.id].dob, 
                    fname: currentRecord.children[action.payload.doc.id].fname,
                    lname: currentRecord.children[action.payload.doc.id].lname,
                    gender: currentRecord.children[action.payload.doc.id].gender,
                    grade: currentRecord.children[action.payload.doc.id].grade,
                    race: currentRecord.children[action.payload.doc.id].race,
                    fatherEmail: currentRecord.fatherEmail,
                    motherEmail: currentRecord.motherEmail,
                  });
                });
              })
            )
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
    formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.myForm.reset();
    this.myForm.setControl('children', this.fb.array([]));
    this.myForm.setControl('fatherPhones', this.fb.array([]));
    this.myForm.setControl('motherPhones', this.fb.array([]));
  }

  public logOut() {
    this.authService.logOut();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub =>{
      sub.unsubscribe();
     //console.log('TCL: RecordEntryComponent -> ngOnDestroy -> sub', sub);
    });
  }
}