import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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
  public startingBalanceDateKey: string;
  public startingBalanceMemoKey: string;
  public startingBalance: number;
  public balanceKey: string;

  private paymentsCollection: string;
  private chargesCollection: string;
  public balance: number;

  public formGroup: FormGroup;
  public formValue: any;
  public showForm: boolean;
  public showSubmitButton: boolean;
  public showHistory: boolean;
  public isEnteringPayment: boolean;
  public isEnteringCharge: boolean;
  public showInputForStartingBalance: boolean;
  public showHistoryButton: boolean;
  public balanceIsNegative: boolean;

  public paymentsCollectionExists: boolean;
  public chargesCollectionExists: boolean;
  public viewIsReady: boolean;

  private subscriptions: any[] = [];

  constructor(private financialsService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.viewIsReady = false;
    this.showHistoryButton = false;
    this.showForm = false;

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
    console.log('TCL: EntryComponent -> ngOnInit -> this.currentFinancialDoc', this.currentFinancialDoc.ref.id);

    // Listen for balance update.  An update could come from the history.component.
    this.financialsService.runningBalanceForCurrentCategory$.subscribe(bal => {
      this.balance = bal;
      if (Math.sign(this.balance) === -1) {
        this.balanceIsNegative = true;
      } else {
        this.balanceIsNegative = false;
      }
    });

    // Listen for category selection from category-select.component
    this.categorySubscription = this.financialsService.currentCategory$
      .subscribe(x => {
        this.category = x;
        if (this.category == null) { return; } // Because the body of the subscribe is ran on init, make sure nothing happens until a category is selected.
        this.viewIsReady = false;
        this.showHistoryButton = false;
        this.showForm = false; // Make sure form is hidden upon category selection until ready as determined in getBlance(), enterPayment(), and enterCharge()
        this.paymentsCollectionExists = false;
        this.chargesCollectionExists = false;
        this.showHistory = false;
        // Obtain keys and collection names (tuitionPayments, tuitionCharges, lunchPayments, etc) based on current category
        // Keys and collections strings should always come from one source: financials.service.
        this.subscriptions.push(this.financialsService.startingBalanceKey$.subscribe(key => this.startingBalanceKey = key));
        this.subscriptions.push(this.financialsService.startingBalanceDateKey$.subscribe(key => this.startingBalanceDateKey = key));
        this.subscriptions.push(this.financialsService.startingBalanceMemoKey$.subscribe(key => this.startingBalanceMemoKey = key));
        this.subscriptions.push(this.financialsService.balanceKey$.subscribe(key => this.balanceKey = key));
        this.subscriptions.push(this.financialsService.paymentsCollection$.subscribe(collection => this.paymentsCollection = collection));
        this.subscriptions.push(this.financialsService.chargesCollection$.subscribe(collection => this.chargesCollection = collection));
        this.isEnteringPayment = false;
        this.isEnteringCharge = false;
        this.getBalance();
        this.setFormControls();
      });
  }

  //  getBalance() run this:
  //  - Each time a category is selected by user
  //  - After submission of startingBalance
  private getBalance() {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[this.startingBalanceKey] || snapshot.data()[this.startingBalanceKey] === 0) { // Important to check for a balance value of zero.
          this.startingBalance = snapshot.data()[this.startingBalanceKey]; // Step A) 
          this.showInputForStartingBalance = false;
          this.showForm = false;  // Hide the form else memo input and submit button will show.
        } else {
          this.showInputForStartingBalance = true;
          this.showForm = true;
        }
        // Check for running balance
        if (snapshot.data()[this.balanceKey] || snapshot.data()[this.balanceKey] === 0) {
          // Make balance available to other components i.e. history by passing it to financials.service
          // And assign value to this.balance via payload from balance$ subject only (in init)
          this.financialsService.runningBalanceForCurrentCategory$.next(snapshot.data()[this.balanceKey]);
        } else {
          this.balance = null;
        }
        this.resetForm();
        this.readyView();
      });
  }

  private setFormControls() {
    this.formGroup = this.fb.group({
      amount: ['', Validators.required],
      date: ['', Validators.required],
      memo: ['', Validators.required],
    });
  }

  public submitHandler(formDirective) {
    this.showSubmitButton = false; // prevent entry from being calc'd multple times as a result of user rapidly pressing enter key multiple times.
    this.formValue = this.formGroup.value;
    if (this.showInputForStartingBalance) {
      this.setBalance(formDirective); // Step B)
    } else { // Balance present.  Next submission will either be for a payement or charge.
      this.processTransaction(formDirective); // Step C)
    }
  }

  private setBalance(fd) {
    // Starting balance in root of currentFinancialDoc, therefore, 
    // starting balance elements must be identified by categeory i.e. lunchStartingBalanceDate, lunchStartingBalanceMemo, etc.
    this.currentFinancialDoc.set({ [this.startingBalanceKey]: this.formValue.amount, [this.startingBalanceDateKey]: this.formValue.date, [this.startingBalanceMemoKey]: this.formValue.memo }, { merge: true })
    // Set the running balance which future Payment/Charges will calc against
    this.currentFinancialDoc.set({ [this.balanceKey]: this.formValue.amount }, { merge: true })
      .then(_ => {
        this.getBalance(); //   Run getBalance to:
        // 1) get state of this.startingBalance to determine submitHandler flow on next submission and;
        // 2) to get the value for this.balance
        this.resetForm(fd);
      })
  }

  private processTransaction(fd) {
    let collection;
    this.isEnteringPayment ?
      collection = this.currentFinancialDoc.collection(this.paymentsCollection) :
      collection = this.currentFinancialDoc.collection(this.chargesCollection);
    //console.log('TCL: EntryComponent -> privateprocessTransaction -> collection', collection.ref.id);

    collection.ref.doc().set({ amount: this.formValue.amount, date: this.formValue.date, memo: this.formValue.memo });
    // NOTE: Wrap formula in () and set input to type number or else + will concat. 
    this.isEnteringPayment ? this.balance -= this.formValue.amount : this.balance = (this.balance + this.formValue.amount);
    this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true })
      .then(_ => {
        this.financialsService.runningBalanceForCurrentCategory$.next(this.balance);
        this.resetForm(fd);
        this.showHistoryButton = true;
        // Run through getTransactions in order to update history table after a payment or charge has been entered.
        this.financialsService.clearTransactionsObservableAndArray();
        this.financialsService.getTransactions(this.currentFinancialDoc, collection.ref.id);
      });
  }

  private readyView() {
    this.viewIsReady = true;
    this.financialsService.showAvatarSpinner$.next(false);
  }

  public enterPayment() {
    this.isEnteringPayment = true;
    this.isEnteringCharge = false;
    this.showForm = true;
    this.resetForm();
  }

  public enterCharge() {
    this.isEnteringPayment = false;
    this.isEnteringCharge = true;
    this.showForm = true;
    this.resetForm();
  }

  private resetForm(formDirective?) {
    if (formDirective) {
      formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    }
    this.formGroup.reset();
    this.showSubmitButton = true;
  }

  public toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}