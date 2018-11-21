import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-entry-category',
  templateUrl: './entry-category.component.html',
  styleUrls: ['./entry-category.component.css']
})
export class EntryCategoryComponent implements OnInit {

  public categories: any[] =[];
  public currentCategory: any;
  public currentFinancialDoc: any;

  public startingBalanceKey: string;
  public startingBalanceDateKey: string;
  public startingBalanceMemoKey: string;
  public runningBalanceKey: string;

  public startingBalance: number;
  public runningBalance: number;

  public enableCatButtons: boolean;
  public balanceIsNegative: boolean;

  public formGroup: FormGroup;
  public formValue: any;
  public formReady: boolean;

  public disableSubmitButton: boolean;

  public userIsAdmin: boolean = false; 
  public userIsSubcriber: boolean = false;

  public isEnteringPayment: boolean = false;
  public isEnteringCharge: boolean = false;

  private chargesCollection: string;
  private paymentsCollection: string;
  
  private subscriptions: any[] = [];

  constructor(private financialsService: FinancialsService, private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit() {

      // Listen for balance update.  An update could come from the history.component.
      // History and entry-category only need to share the running balance per category
      this.financialsService.runningBalanceForCurrentCategory$.subscribe(bal => {
        this.runningBalance = bal;
        if (Math.sign(this.runningBalance) === -1) {
          this.balanceIsNegative = true;
        } else {
          this.balanceIsNegative = false;
        }
      });

    // Prevent a student's category entry form from showing when 
    // going from financials, to the record list, back to financials
    this.financialsService.currentCategory$.next(null); 

    this.isEnteringCharge = false;
    this.isEnteringPayment = false;

    this.setFormControls();

    this.categories = this.financialsService.categories;

    this.subscriptions.push(
        this.financialsService.currentStudent$.subscribe(student =>{
        if(student){
          this.enableCatButtons = true;
        }else{
          this.enableCatButtons = false;
        }
      })
    )
    // Current financial doc set by student-select.component.
    this.subscriptions.push(
      this.financialsService.currentFinancialDoc$.subscribe(doc => this.currentFinancialDoc = doc)
    );

    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        this.currentCategory = cat; // Allow currentCategory to be set to null (null passed from select student).
        if(cat){
          this.startingBalanceKey = cat.key + 'StartingBalance';
          this.startingBalanceDateKey = cat.key + 'StartingBalanceDate';
          this.startingBalanceMemoKey = cat.key + 'StartingBalanceMemo';
          this.runningBalanceKey = cat.key + 'RunningBalance';
          this.chargesCollection = cat.key + 'Charges';
          this.paymentsCollection = cat.key + 'Payments';
        }
      })
    );


    this.subscriptions.push(
      this.authService.userIsAdmin$.subscribe(x => {
        this.userIsAdmin = x;
      })
    );

    this.subscriptions.push(
      this.authService.userIsSubcriber$.subscribe(x => {
        this.userIsSubcriber = x;
      })
    )

  }

  public setCategoryPropsAndCollections(cat){
    this.formReady = false;
    this.financialsService.currentCategory$.next(cat);
    this.checkForBalance();
  }

  private checkForBalance(){
    this.currentFinancialDoc.ref.get().then( 
      snapshot => { 
        if (snapshot.data()[this.startingBalanceKey] || snapshot.data()[this.startingBalanceKey] === 0) { // Important to check for a balance value of zero.
          this.startingBalance = snapshot.data()[this.startingBalanceKey];
          this.runningBalance = snapshot.data()[this.runningBalanceKey];
          this.financialsService.runningBalanceForCurrentCategory$.next(snapshot.data()[this.runningBalanceKey]);
        } else {
          this.startingBalance = null;
        }
        this.formReady = true;
      }
    )
  }

  private setFormControls() {
    this.formGroup = this.fb.group({
      amount: ['', Validators.required],
      date: ['', Validators.required],
      memo: ['', Validators.required],
    });
  }

  public submitHandler(formDirective) {
    this.formValue = this.formGroup.value;
    this.disableSubmitButton = true; // prevent entry from being calc'd multple times as a result of user rapidly pressing enter key multiple times.

    if(!this.startingBalance){
      this.currentFinancialDoc.ref.set({
        [this.startingBalanceKey]: this.formValue.amount, 
        [this.startingBalanceDateKey]: this.formValue.date,
        [this.startingBalanceMemoKey]: this.formValue.memo, 
        [this.runningBalanceKey]: this.formValue.amount}, 
        { merge: true })
          .then( _ => {
            this.resetForm(formDirective);
            this.checkForBalance();
          })
           // Now that a starting balance has been entered, check for balance in order to set startingBlance so that transactions form elements show.
    }else{
      this.processTransaction(formDirective);
    }
  
  }

  private processTransaction(formDirective){
    let collection;

    this.isEnteringPayment ?
      collection = this.currentFinancialDoc.ref.collection(this.paymentsCollection) :
      collection = this.currentFinancialDoc.ref.collection(this.chargesCollection);

      collection.doc().set({ amount: this.formValue.amount, date: this.formValue.date, memo: this.formValue.memo });
      // Calc running balance based on payment or charge then set.
      // NOTE: Wrap formula in () and set input to type number or else + will concat. 
      this.isEnteringPayment ? this.runningBalance -= this.formValue.amount : this.runningBalance = (this.runningBalance + this.formValue.amount);
      this.currentFinancialDoc.ref.set({ [this.runningBalanceKey]: this.runningBalance }, 
        { merge: true }) .then( _ => {
          this.resetForm(formDirective);
        })
  }

  public enterPayment() {
    this.isEnteringPayment = true;
    this.isEnteringCharge = false;
    this.resetForm();
  }

  public enterCharge() {
    this.isEnteringPayment = false;
    this.isEnteringCharge = true;
    this.resetForm();
  }

  private resetForm(formDirective?) {
    if (formDirective) {
      formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    }
    this.formGroup.reset();
    this.disableSubmitButton = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
