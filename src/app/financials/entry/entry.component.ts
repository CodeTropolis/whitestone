import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnInit {

  private categorySubscription: any;
  private latestCostSubscription: any;

  // Keys set based on category
  public costKey: string;
  public paymentKey: string;
  public deductionKey: string;
  public balanceKey: string;

  public costMemoKey: string;
  public paymentMemoKey: string;
  public deductionMemoKey: string;

  public hasHistory: boolean;

  public currentFinancialDoc: any;
  public category: any;

  private startingCostCollection: string;
  private paymentsCollection: string;
  private deductionsCollection: string;

  public formGroup: FormGroup;
  public costExists: boolean;
  public showHistory: boolean;
  public showView: boolean;
  public formValue: any;

  public balance: number;
  public cost: number;

  public payments: any[] = [];
  public deductions: any[] = [];

  public isEnteringPayment: boolean;
  public isEnteringDeduction: boolean;

  public latestCost$: Observable<any[]>;

  public showSubmitButton: boolean;



  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {
    console.log(`entry.component init()`);
    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

    // listen to catetory selection (tuition, lunch, etc) from financials-main.component
    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        this.costExists = false; // Previous selected category may have set this to true. Set to false then check for cost 
        this.showView = false;
        this.category = x;
        if (this.category) {
          this.financialService.showAvatarSpinner$.next(true); // financials-main.component subscribes to this to determine spinner display show/hide

           // Buid collection names.
           this.startingCostCollection = this.category.key + 'StartingCost';
           this.paymentsCollection = this.category.key + 'Payments';
           this.deductionsCollection = this.category.key + 'Deductions';

          this.costKey = this.category.key + 'Cost';
          this.paymentKey = this.category.key + 'Payment';
          this.deductionKey = this.category.key + 'Deduction'
          this.balanceKey = this.category.key + 'Balance';

          this.costMemoKey = this.category.key + 'CostMemo';
          this.paymentMemoKey = this.category.key + 'PaymentMemo';
          this.deductionMemoKey = this.category.key + 'DeductionMemo';

          this.getStartingCost();
          this.getBalance();
          this.history();
          this.showHistory = false;
          this.isEnteringDeduction = false;
          this.isEnteringPayment = false;
          this.showSubmitButton = true;

          // Current category may have a history upon init.  
          // Set hasHistory based on presence of payment or deduction subcollection.

          // Check for a payment in the current category's payments subcollection
          const latestPayment = this.currentFinancialDoc.collection(this.paymentsCollection,
            ref => {
              const doc = ref.orderBy('date', 'desc').limit(1);
              return doc;
            }).valueChanges();

          latestPayment.subscribe(payload => {
            if (payload.length != 0) { // Payload is an array of one element (the object of the latest doc)
              console.log(`${this.paymentsCollection} exists`);
              this.hasHistory = true;
            } else {
              console.log(`${this.paymentsCollection} does not exist.`);
              this.hasHistory = false;
            }
          });

          // Check for a payment in the current category's deductions subcollection
          const latestDeduction = this.currentFinancialDoc.collection(this.deductionsCollection,
            ref => {
              const doc = ref.orderBy('date', 'desc').limit(1);
              return doc;
            }).valueChanges();

          latestDeduction.subscribe(payload => {
            if (payload.length != 0) { // Payload is an array of one element (the object of the latest doc)
              console.log(`${this.deductionsCollection} exists`);
              this.hasHistory = true;
            } else {
              console.log(`${this.deductionsCollection} does not exist.`);
              this.hasHistory = false;
            }
          });


        }
      });
  }

  private getStartingCost() {
    // Starting cost is now a collection. 
    // Get the latest starting cost by obtaining the latest document from collection based on date.
    this.latestCost$ = this.currentFinancialDoc.collection(this.startingCostCollection,
      ref => {
        const doc = ref.orderBy('date', 'desc').limit(1);
        return doc;
      }).valueChanges()

    this.latestCostSubscription = this.latestCost$.subscribe(payload => {
      if (payload.length != 0) { // Payload is an array of one element (the object of the latest doc)
        payload.forEach(x => {
          this.cost = x.startingCost;
          this.costExists = true;
          console.log(`Starting cost for: ${this.category.key}: ${this.cost}`);
          this.showView = true; // Show view which will dynamically determine showing either the paymentor deduction forms.
          this.financialService.showAvatarSpinner$.next(false);
        });
      } else {
        console.log(`No starting cost for: ${this.category.key}`);
        this.costExists = false;
        this.showStartingCostForm();
      }
    });
  }

  private getBalance() {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[this.balanceKey]) { // If the balance exists in the database, set this.balance to value from db
          this.balance = snapshot.data()[this.balanceKey];
        }
      });
  }

  private processBalance(key, formDirective) {
    //console.log("processBalance()");
    this.currentFinancialDoc.ref.get()
      .then(_ => {
        if (key.includes('tuition')) {
          this.balance -= this.formValue[this.paymentKey];
        } else { // Its not tution so process balance by adding payments and subtracting deductions to existing balance
          if (this.isEnteringPayment) {
            this.balance = (this.balance + this.formValue[this.paymentKey]); // NOTE: Wrap formula in () and set input to type number or else += concats. 
          }
          if (this.isEnteringDeduction) {
            this.balance -= this.formValue[this.deductionKey];
          }
        }
        this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true })
          .then(_ => {
            // Possibly do something here...
          });
      }
      );
  }

  private setupStartingCostFormControls() {
    this.formGroup = this.fb.group({
      [this.costKey]: ['', Validators.required],
      [this.costMemoKey]: ['', Validators.required],
    });
  }

  private setupPaymentFormControls() {
    this.formGroup = this.fb.group({
      [this.paymentKey]: ['', Validators.required],
      [this.paymentMemoKey]: ['', Validators.required],
    });
  }

  private setupDeductionFormControls() {
    this.formGroup = this.fb.group({
      [this.deductionKey]: ['', Validators.required],
      [this.deductionMemoKey]: ['', Validators.required],
    });
  }

  async submitHandler(formDirective) {
    this.showSubmitButton = false; // Prevent value from multiple entry upon rapid repeat of enter key
    console.log('submitHandler');
    let date = new Date();
    this.formValue = this.formGroup.value;
    try {
      if (!this.costExists) {
        // Give starting cost its own subcollection
        const currentCollection = this.currentFinancialDoc.collection(this.startingCostCollection); // creates the subcollection
        // Create a document under the subcollection.  Document name is auto set.
        await currentCollection.ref.doc().set({ startingCost: this.formValue[this.costKey], memo: this.formValue[this.costMemoKey], date: new Date })
          .then(_ => {
            // Will remove section that shows cost form for current category
            this.costExists = true;
            // Update the cost property else cost will show from previously selected category
            this.cost = this.formValue[this.costKey];
            // Initially, balance will equal cost.
            this.balance = this.cost;
            // Write the initial balance to the database.
            this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true }) // Balance for current category will be placed on the root of the current financial doc
            this.resetForm(formDirective);
          });
      } else {
        // Payments and deductions will be subcollections i.e. lunchPayments, lunchDeductions.  
        if (this.isEnteringPayment) {
          const currentCollection = this.currentFinancialDoc.collection(this.paymentsCollection);
          await currentCollection.doc(date.toString()).set({ payment: this.formValue[this.paymentKey], memo: this.formValue[this.paymentMemoKey], date: new Date })
            .then(_ => {
              this.processBalance(this.balanceKey, formDirective);
              this.resetForm(formDirective);
              this.history();
            });
        }
        if (this.isEnteringDeduction) {
          const currentCollection = this.currentFinancialDoc.collection(this.deductionsCollection);
          await currentCollection.doc(date.toString()).set({ deduction: this.formValue[this.deductionKey], memo: this.formValue[this.deductionMemoKey], date: new Date })
            .then(_ => {
              this.processBalance(this.balanceKey, formDirective);
              this.resetForm(formDirective);
              this.history();
            }
            );
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  public history() {
    // Clear out array else view will aggregate - will repeat array for each entry.
    this.payments = [];
    this.deductions = [];

    this.currentFinancialDoc.collection(this.paymentsCollection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            this.payments.push({ payment: item.data().payment, date: date, memo: item.data().memo })
          }
        )
      });

    this.currentFinancialDoc.collection(this.deductionsCollection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            this.deductions.push({ deduction: item.data().deduction, date: date, memo: item.data().memo })
          }
        )
      });

    this.hasHistory = true;
  }

  private showStartingCostForm() {
    this.setupStartingCostFormControls();
    this.showView = true;
    this.financialService.showAvatarSpinner$.next(false);
  }

  public showPaymentForm() {
    this.isEnteringPayment = true;
    this.isEnteringDeduction = false;
    this.setupPaymentFormControls();
    this.showView = true;
    this.financialService.showAvatarSpinner$.next(false);
  }

  public showDeductionForm() {
    this.isEnteringPayment = false;
    this.isEnteringDeduction = true;
    this.setupDeductionFormControls();
    this.showView = true;
    this.financialService.showAvatarSpinner$.next(false);
  }

  private resetForm(formDirective) {
    formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.formGroup.reset();
    this.showView = true;
    this.financialService.showAvatarSpinner$.next(false);
    this.showSubmitButton = true;
  }

  public toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  ngOnDestroy() {
    this.categorySubscription.unsubscribe();
    this.latestCostSubscription.unsubscribe();
  }

}
