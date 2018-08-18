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

  // Keys set based on category
  public costKey: string;
  public paymentKey: string;
  public deductionKey: string;
  public balanceKey: string;

  public costMemoKey: string;
  public paymentMemoKey: string;
  public deductionMemoKey: string;

  public currentFinancialDoc: any;
  public category: any;
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

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {
    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

    // listen to catetory selection (tuition, lunch, etc) from financials-main.component
    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        this.costExists = false; // Previous selected category may have set this to true. Set to false then check for cost 
        this.showView = false;
        this.category = x;
        if (this.category) {
          this.financialService.showAvatarSpinner$.next(true); // financials-main.component subscribes to this to determine spinner display show/hide

          this.costKey = this.category.key + 'Cost';
          this.paymentKey = this.category.key + 'Payment';
          this.deductionKey = this.category.key + 'Deduction'
          this.balanceKey = this.category.key + 'Balance';

          this.costMemoKey = this.category.key + 'CostMemo';
          this.paymentMemoKey = this.category.key + 'PaymentMemo';
          this.deductionMemoKey = this.category.key + 'DeductionMemo';

          this.getStartingCost();
          this.getBalance();
          this.history(this.category);
          this.showHistory = false;
          this.isEnteringDeduction = false;
          this.isEnteringPayment = false;

        }
      });
  }

  private getStartingCost() {
    // Starting cost is now a collection.  
    // Get the latest starting cost by obtaining the latest document based on date.
    this.latestCost$ = this.currentFinancialDoc.collection(this.category.key + 'StartingCost',
      ref => {
        const doc = ref.orderBy('date', 'desc').limit(1);
        return doc;
      }).valueChanges()

    this.latestCost$.subscribe(payload => {
      if (payload.length != 0) { // Payload is an array of one element (the object of the latest doc)
        payload.forEach(x => {
          this.cost = x.startingCost;
          this.costExists = true;
        });
      } else {
        console.log(`No starting cost for: ${this.category.key}`);
        this.costExists = false;
       // this.setupFormGroup();
       this.setupStartingCostForm();
      }
    });
  }

  private getBalance() {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[this.balanceKey]) { // If the balance exists in the database, set this.balance to value from db
          this.balance = snapshot.data()[this.balanceKey];
        }else{return;}
        // else {
        //   this.balance = this.cost; // If balance does not exist in db, balance is set to cost
        // }
       // this.setupFormGroup(); 
        // this.showView = true;
        // this.financialService.showAvatarSpinner$.next(false);
      });
  }

  private processBalance(key) {
    this.currentFinancialDoc.ref.get().then(
      _ => {
        if (key.includes('tuition')) {
          this.balance -= this.formValue[this.paymentKey];
        } else { // Its not tution so process balance by adding payments and subtracting deductions to existing balance
          if (this.formValue[this.paymentKey] !== "") {
            this.balance = (this.balance + this.formValue[this.paymentKey]); // NOTE: Wrap formula in () and set input to type number or else += concats. 
          }
          if (this.formValue[this.deductionKey] !== "") {
            this.balance -= this.formValue[this.deductionKey];
          }
        }
        this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true });
      }
    );
  }

  private setupStartingCostForm() {
    this.formGroup = this.fb.group({
      [this.costKey]: ['', Validators.required],
      [this.costMemoKey]: ['', Validators.required],
    });
    this.showView = true;
    this.financialService.showAvatarSpinner$.next(false);
  }

  // private setupPaymentForm() {
  //   this.formGroup = this.fb.group({
  //     [this.paymentKey]: ['', Validators.required],
  //     [this.paymentMemoKey]: ['', Validators.required],
  //   });
  //   this.showView = true;
  //   this.financialService.showAvatarSpinner$.next(false);
  // }

  // private setupDeductionForm() {
  //   this.formGroup = this.fb.group({
  //     [this.deductionKey]: ['', Validators.required],
  //     [this.deductionMemoKey]: ['', Validators.required],
  //   });
  //   this.showView = true;
  //   this.financialService.showAvatarSpinner$.next(false);
  // }

  // private setupFormGroup() {
  //   if (!this.costExists) {
  //     this.formGroup = this.fb.group({
  //       [this.costKey]: ['', Validators.required],
  //       [this.costMemoKey]: ['', Validators.required],
  //     });
  //   } else {
  //     this.formGroup = this.fb.group({
  //       [this.paymentKey]: [''], // Validators here must be conditional or create separate form setups based on if cost, if payment, if deduction.
  //       [this.paymentMemoKey]: [''],
  //       [this.deductionKey]: [''],
  //       [this.deductionMemoKey]: [''],
  //     });
  //   }
  //   this.showView = true;
  //   this.financialService.showAvatarSpinner$.next(false);
  // }

  async submitHandler(formDirective) {
    console.log('submitHandler');
    let date = new Date();
    this.formValue = this.formGroup.value;
    try {
      if (!this.costExists) {
        // Give starting cost its own subcollection
        const currentCategorySubcollection = this.currentFinancialDoc.collection(this.category.key + 'StartingCost'); // creates the subcollection
        // Create a document under the subcollection.  Document name is auto set.
        await currentCategorySubcollection.ref.doc().set({ startingCost: this.formValue[this.costKey], memo: this.formValue[this.costMemoKey], date: new Date })
          .then(() => {
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
        if (this.formValue[this.paymentKey] !== "") {
          const currentCategorySubcollection = this.currentFinancialDoc.collection(this.category.key + 'Payments');
          await currentCategorySubcollection.doc(date.toString()).set({ payment: this.formValue[this.paymentKey], memo: this.formValue[this.paymentMemoKey], date: new Date })
            .then(_ => {
              this.processBalance(this.balanceKey);
              this.resetForm(formDirective);

              // Update history
              this.history(this.category);

            });
        }
        if (this.formValue[this.deductionKey] !== "") {
          const currentCategorySubcollection = this.currentFinancialDoc.collection(this.category.key + 'Deductions');
          await currentCategorySubcollection.doc(date.toString()).set({ deduction: this.formValue[this.deductionKey], memo: this.formValue[this.deductionMemoKey], date: new Date })
            .then(_ => {
              this.processBalance(this.balanceKey);
              this.resetForm(formDirective);

              // Update history
              this.history(this.category);
            }
            );
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  public history(cat) {
    // Clear out array else view will aggregate - will repeat array for each entry.
    this.payments = [];
    this.deductions = [];

    this.currentFinancialDoc.collection(cat.key + 'Payments').ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            this.payments.push({ payment: item.data().payment, date: date })
          }
        )
      }
      );

    this.currentFinancialDoc.collection(cat.key + 'Deductions').ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            this.deductions.push({ deduction: item.data().deduction, date: date })
          }
        )
      }
      );
  }

  public toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  public showPaymentForm() {
    this.isEnteringPayment = true;
    this.isEnteringDeduction = false;
    //this.setupPaymentForm();
  }


  public showDeductionForm() {
    this.isEnteringPayment = false;
    this.isEnteringDeduction = true;
    //this.setupDeductionForm();
  }


  private resetForm(formDirective) {
    formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.formGroup.reset();
    //this.setupFormGroup();
  }

  ngOnDestroy() {
    this.categorySubscription.unsubscribe();
  }

}
