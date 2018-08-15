import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DataService } from '../../core/services/data.service';

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

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {
    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

    // listen to catetory selection (tuition, lunch, etc) from financials-main.component
    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        this.costExists = false; // Previous seleted category may have set this to true. Set to false then check for cost 
        this.showView = false;
        this.category = x;
        if (this.category) {
          this.financialService.showAvatarSpinner$.next(true); // financials-main.component subscribes to this to determine spinner display show/hide
          this.costKey = this.category.key + 'Cost';
          this.paymentKey = this.category.key + 'Payment';
          this.deductionKey = this.category.key + 'Deduction'
          this.balanceKey = this.category.key + 'Balance';
          this.checkForCost(this.costKey);
          this.history(this.category);
          this.showHistory = false;
        }
      });
  }

  private checkForCost(costKey) {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[costKey]) {
          this.cost = snapshot.data()[costKey];
          if (snapshot.data()[this.balanceKey]) {
            this.balance = snapshot.data()[this.balanceKey];
          } else {
            this.balance = this.cost;
          }
          this.costExists = true;
        }
        this.setupFormGroup(this.category); // Do this only after cost state determined.
      }
    );
  }

  private processBalance(key) {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[key]) {
          this.balance = snapshot.data()[key];
        }
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

  private setupFormGroup(category: any) {
    if (!this.costExists) {
      this.formGroup = this.fb.group({
        [this.costKey]: ['', Validators.required],
      });
      // this.showView = true;
      // this.financialService.showAvatarSpinner$.next(false);
      // Cost exist at this point. 
      // Set up payment and deduction fields.
    } else {
      this.formGroup = this.fb.group({
        [this.paymentKey]: [''],
        [this.deductionKey]: [''] // View will not show this field if category is Tuition
      });
      // this.showView = true;
      // this.financialService.showAvatarSpinner$.next(false);
    }
    this.showView = true;
    this.financialService.showAvatarSpinner$.next(false);
  }

  async submitHandler(formDirective) {
    this.formValue = this.formGroup.value;
    try {
      if (!this.costExists) {
        await this.currentFinancialDoc.set({ [this.costKey]: this.formValue[this.costKey] }, { merge: true })
          .then(() => {
            // Will remove section that shows cost form for current category
            this.costExists = true;
            // Update the cost property else cost will show from previously selected category
            this.cost = this.formValue[this.costKey];
            // Initially, balance will equal cost.
            this.balance = this.cost;
            // Write the initial balance to the database.
            this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true })
            this.resetForm(formDirective);
          });
      } else {
        let date = new Date();
        // Payments and deductions will be subcollections i.e. lunchPayments, lunchDeductions.  
        if (this.formValue[this.paymentKey] !== "") {
          const currentCategorySubcollection = this.currentFinancialDoc.collection(this.category.key + 'Payments'); // creates the subcollection
          await currentCategorySubcollection.doc(date.toString()).set({ payment: this.formValue[this.paymentKey], date: new Date })
            .then(_ => {
              this.processBalance(this.balanceKey);
              this.resetForm(formDirective);

              // Update history
              this.history(this.category);

            });
        }
        if (this.formValue[this.deductionKey] !== "") {
          const currentCategorySubcollection = this.currentFinancialDoc.collection(this.category.key + 'Deductions');
          await currentCategorySubcollection.doc(date.toString()).set({ deduction: this.formValue[this.deductionKey], date: new Date })
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

  public showPaymentForm(){
    this.isEnteringPayment = true;
    this.isEnteringDeduction = false;
  }


  public showDeductionForm(){
    this.isEnteringPayment = false;
    this.isEnteringDeduction = true;
  }


  private resetForm(formDirective) {
    formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.formGroup.reset();
    this.setupFormGroup(this.category);
  }

  ngOnDestroy() {
    this.categorySubscription.unsubscribe();
  }

}
