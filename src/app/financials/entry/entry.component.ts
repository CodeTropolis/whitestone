import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnInit {

  private categorySubscription: any;
  public currentFinancialDoc: any;
  public category: any;
  public balanceKey: string;
  public balance: number;
  public formGroup: FormGroup;
  public formValue: any;
  public showForm: boolean;
  public showSubmitButton: boolean;
  public isEnteringPayment: boolean;
  public isEnteringCharge: boolean;

  private paymentsCollection: string;
  private chargesCollection: string;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.showForm = false;

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {

        this.category = x;
        // Because the body of the subscribe is ran on init(why?), 
        // make sure nothing happens until a category is selected.
        if (this.category == null) { return }

        this.balanceKey = this.category.key + 'Balance';
        this.paymentsCollection = this.category.key + 'Payments';
        this.chargesCollection = this.category.key + 'Charges';

        this.checkForBalance();
        this.setFormControls();
      });
  }

  // 1) Check for balance. Submit handler flow determined by presence of balance i.e.
  //    if no balance, post either payment or charge as balance.
  private checkForBalance() {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[this.balanceKey]) {
          this.balance = snapshot.data()[this.balanceKey];
          // console.log(`this.balance: ${this.balance}`);
        } else {
          // console.log('balanceKey does not exist');
          this.balance = null;
        }
        this.financialService.showAvatarSpinner$.next(false);
      });
  }

  private setFormControls() {
    this.formGroup = this.fb.group({
      amount: ['', Validators.required],
      memo: ['', Validators.required],
    });
  }

  public enterPayment() {
    this.isEnteringPayment = true;
    this.isEnteringCharge = false;
    this.showForm = true;
  }

  public enterCharge() {
    this.isEnteringPayment = false;
    this.isEnteringCharge = true;
    this.showForm = true;
  }

  public submitHandler() {
    this.showSubmitButton = false;
    this.formValue = this.formGroup.value;
    // 2) If no balance, save either payment or charge as balance to currentFinancialDoc 
    if (!this.balance) {
      console.log(`${this.category.val} does not have a balance`);
      // whatever was selected, payment or charge will be set as balance
      this.currentFinancialDoc.set({ [this.balanceKey]: this.formValue.amount, [this.balanceKey + 'Memo']: this.formValue.memo }, { merge: true })
        .then(_ => {
          this.checkForBalance(); // If user does not select another category, checkForBlance will not run, so run it here.
          // Before another payment or change can be entered, hide the form which will force user to select either Enter Payment or 
          // Enter Charge in order to fire enterPayment() or enterCharge() to set the booleans set to correct value for step 3)
          this.showForm = false;
          this.resetForm();
        })
      // 3) If balance, create a payment or charge subcollection,
      // write the payment / charges document to its respective subcollection then 
      // subtract payment from balance or add charges to balance
    } else {
      console.log(`${this.category.val} balance: ${this.balance}`);
      if (this.isEnteringPayment) {
        const collection = this.currentFinancialDoc.collection(this.paymentsCollection); // creates the subcollection
        collection.ref.doc().set({ amount: this.formValue.amount, memo: this.formValue.memo, date: new Date })
        // Update balance and write to currentFinancialDoc
        this.balance -= this.formValue.amount;
        // ToDo - no memo for initial balance? since no running record of balance
        this.currentFinancialDoc.set({ [this.balanceKey]: this.formValue.amount, [this.balanceKey + 'Memo']: "balance had a payment deducted" }, { merge: true })
          .then( this.resetForm()) ;
      }
      if (this.isEnteringCharge) {
        const collection = this.currentFinancialDoc.collection(this.chargesCollection); // creates the subcollection
        collection.ref.doc().set({ amount: this.formValue.amount, memo: this.formValue.memo, date: new Date })
        this.balance = (this.balance + this.formValue.amount); // NOTE: Wrap formula in () and set input to type number or else += concats. 
        this.currentFinancialDoc.set({ [this.balanceKey]: this.formValue.amount, [this.balanceKey + 'Memo']: "balance had a charge added" }, { merge: true })
          .then( this.resetForm()) ;
      }
    }
  }


  private resetForm(formDirective?) {
    // formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.formGroup.reset();
    this.showSubmitButton = true;
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

}
