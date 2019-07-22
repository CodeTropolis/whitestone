import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FirebaseService } from '../core/services/firebase.service';
import { RecordFormService } from '../core/services/record-form.service';
import { DataService } from '../core/services/data.service';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { AngularFirestore} from '@angular/fire/firestore';
import { ModalService } from '../modal/modal.service';


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

  public grade: any[] = [
    { value: "PK3", display: "Pre K 3" },
    { value: "PK4", display: "Pre K 4" },
    { value: "K", display: "K" },
    { value: "1", display: "1"},
    { value: "2", display: "2" },
    { value: "3", display: "3" },
    { value: "4", display: "4" },
    { value: "5", display: "5" },
    { value: "6", display: "6" },
    { value: "7", display: "7" },
    { value: "8", display: "8" },
  ]

  public catholic: any[] = [
    // value is Catholic in order to filter table by 'Catholic' versus
    // filtering by 'yes' or 'no'.  There may be other Yes/No options in the future.
    { value: 'Catholic', display: 'Yes' },
    { value: 'No', display: 'No' },
  ]

  constructor(
    private rfs: RecordFormService,
    private fs: FirebaseService,
    private fb: FormBuilder,
    private authService: AuthService,
    private afs: AngularFirestore,
    private modalService: ModalService,
    private dataService: DataService) { }

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
    });
    // Get a reference to this form so that operations can 
    // be performed on the form in the record-entry.service
    this.rfs.theForm = this.myForm;
    // State of isUpdated set by the service
    this.subscriptions.push(this.rfs.isUpdating$.subscribe(x => this.isUpdating = x));

    // Get the id of the current record which is set by the more-menu on the record-list.component
    this.dataService.currentRecord$.subscribe(currentRecord =>{
      if (currentRecord){
        this.currentRecordId = currentRecord.realId;
      }
    });

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
    });
    this.childrenForm.push(child);
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
    };

    if (!this.isUpdating) {
      try {
        // Add a new record
        this.fs.recordCollection.add(data).then(() => {
            this.resetForm(formDirective);
            this.modalService.close('record-entry-modal');
          });
      } catch (err) {
        console.log(err);
      }
    }
    if (this.isUpdating) {
      try {
        // Update current record
        this.fs.recordCollection.doc(this.currentRecordId).update(data).then(() => {
          this.rfs.isUpdating$.next(false);
          this.resetForm(formDirective);
          this.modalService.close('record-entry-modal');

          // Set the current record to the updated values so the student-category view will pick up on the changes when
          // the current record is updated from the student-category.component.
          // Issue: upon updating record from student-category, and then doing another update, 
          // the DoB fields in form are blank...

          // Reason: Here, the date is formated as a date, not a timestamp
          //this.dataService.setCurrentRecord({realId:this.currentRecordId, ...data})
         // console.log('TCL: submitHandler -> data', data)

        });
      } catch (err) {
        console.log(err);
      }
    }
    this.syncFinancialDocs(data, this.currentRecordId);
  }

  private convertArrayToMapWithUUid(arr: any[]) {
    const map = {};
    arr.forEach(obj => {
      const uuid = obj.id || this.afs.createId();
      obj.id = uuid;
      map[`${uuid}`] = obj;
    });
    return map;
  }


  private syncFinancialDocs(record, currentRecordId) {
    const children = this.dataService.convertMapToArray(record.children);
    children.forEach(child => {
      this.fs.financialsCollection.doc(child.id)
        .set({
          recordId: currentRecordId,
          // In the beginning, email properties and child's grade level did not exist on the financial doc. 
          // This will ensure that these properties from the currentRecord are copied over and stay in sync.
          fatherEmail: record.fatherEmail,
          motherEmail: record.motherEmail,
          // Create / sync other child info.  Note: grade property added on 3/18/19.
          childFirstName: child.fname,
          childLastName: child.lname,
          grade: record.children[child.id].grade,
        },  { merge: true })
          .then(_ => {});
    });
  }

  public cancel(formDirective) {
    this.resetForm(formDirective);
    this.closeModal('record-entry-modal');
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


  closeModal(id: string) {
    this.modalService.close(id);
    this.rfs.isUpdating$.next(false);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
      //console.log('TCL: RecordEntryComponent -> ngOnDestroy -> sub', sub);
    });
  }
}