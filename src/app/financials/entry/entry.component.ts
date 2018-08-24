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

  public startingBalanceKey: string;
  public startingBalanceMemoKey: string;
  public startingBalance: number;

  // Balance will update based on transaction. 
  // Memos given for transations (Payments and Charges) so no memo given on running balance.
  public balanceKey: string;
  public balance: number;

  public formGroup: FormGroup;
  public formValue: any;
  public showForm: boolean;
  public showSubmitButton: boolean;
  public showHistory: boolean;
  public isEnteringPayment: boolean;
  public isEnteringCharge: boolean;
  public showTransactionSection: boolean
  public showHistoryButton: boolean

  private paymentsCollection: string;
  private chargesCollection: string;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.showTransactionSection = false;
    this.showForm = false;
    this.showHistoryButton = false;

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        // console.log(`in subscribe`)
        this.category = x;
        // Because the body of the subscribe is ran on init(why?), need to make sure nothing happens until a category is selected.
        if (this.category == null) { return }
        this.showHistoryButton = false;
        this.startingBalanceKey =       this.category.key + 'StartingBalance';
        this.startingBalanceMemoKey =   this.category.key + 'StartingBalanceMemo';
        this.balanceKey =               this.category.key + 'Balance';

        this.paymentsCollection =       this.category.key + 'Payments';
        //console.log(`paymentsCollection name: ${this.paymentsCollection}`);
        this.chargesCollection =        this.category.key + 'Charges';
        //console.log(`chargesCollection name: ${this.chargesCollection}`);

        this.showTransactionSection = true;

        this.getBalances();
        this.checkForTransaction();
        this.setFormControls();
      });
  }

  // 1) Check for starting and running blaance. Submit handler flow determined by presence of balance.
  private getBalances() {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[this.startingBalanceKey]) {
          this.startingBalance = snapshot.data()[this.startingBalanceKey];
        } else {
          this.startingBalance = null;
        }
        // Check for running balance
        if (snapshot.data()[this.balanceKey]) {
          this.balance = snapshot.data()[this.balanceKey];
        } else {
          this.balance = null;
        }
        this.financialService.showAvatarSpinner$.next(false);
      });
  }

  private checkForTransaction() {
    // console.log(`checkForTransaction`);
    if (this.dataService.checkForCollection(this.currentFinancialDoc, this.paymentsCollection) ||
      this.dataService.checkForCollection(this.currentFinancialDoc, this.chargesCollection)) {
      this.showHistoryButton = true;
    }
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
    this.showSubmitButton = true;
  }

  public enterCharge() {
    this.isEnteringPayment = false;
    this.isEnteringCharge = true;
    this.showForm = true;
    this.showSubmitButton = true;
  }

  public submitHandler(formDirective) {
    this.showSubmitButton = false;
    this.formValue = this.formGroup.value;
    // 2) If no balance, save either payment or charge as the starting balance to currentFinancialDoc 
    if (!this.balance) {
      // Whatever was entered, either payment or charge, will be set as the startingbalance
      this.currentFinancialDoc.set({ [this.startingBalanceKey]: this.formValue.amount, [this.startingBalanceMemoKey]: this.formValue.memo }, { merge: true });
      // Set the running balance.  This will be the blance that future Payment/Charges will calc against
      this.currentFinancialDoc.set({ [this.balanceKey]: this.formValue.amount }, { merge: true })
        .then(_ => {
          this.getBalances(); // If user does not select another category, getBalances will not run, so run it here.
          
          // Before another payment or change can be entered, hide the form which will force user to select either Enter Payment or 
          // Enter Charge in order to fire enterPayment() or enterCharge() to set the booleans set to correct value for step 3)
          this.showForm = false;
          this.resetForm(formDirective);
        })

      // 3) else If balance:
      //  A) Create a payment or charge subcollection,
      //  B) Write the payment / charge to the document under the respective subcollection  
      //  C) Subtract payment from balance or add charges to balance
      //  D) Update the currentFincial doc with updated balance
      //  E) Now that a transaction occured, run checkForTransaction in order to set showHistoryButton state.

    } else { // 3)
      if (this.isEnteringPayment) {
        const collection = this.currentFinancialDoc.collection(this.paymentsCollection);                        // A)
        collection.ref.doc().set({ amount: this.formValue.amount, memo: this.formValue.memo, date: new Date })  // B)
        this.balance -= this.formValue.amount;                                                                  // C)
        this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true })                      // D)
          .then(_ => {
            this.resetForm(formDirective);
            this.checkForTransaction();                                                                         // E)                                                                   
          });
      }
      if (this.isEnteringCharge) {
        const collection = this.currentFinancialDoc.collection(this.chargesCollection);
        collection.ref.doc().set({ amount: this.formValue.amount, memo: this.formValue.memo, date: new Date })
        this.balance = (this.balance + this.formValue.amount); // NOTE: Wrap formula in () and set input to type number or else concats. 
        this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true })
          .then(_ => {
            this.resetForm(formDirective);
            this.checkForTransaction();
          });
      }
    }
  }


  private resetForm(formDirective?) {
    if (formDirective) {
      formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    }
    this.formGroup.reset();
    this.showSubmitButton = true;
  }

  public toggleHistory() {
    //this.dataService.getTransactions(this.category, this.paymentsCollection, this.deductionsCollection); // run again to prevent dup entries from showing on history table.
    this.showHistory = !this.showHistory;
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

}
