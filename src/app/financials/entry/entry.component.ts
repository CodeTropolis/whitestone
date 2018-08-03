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
  public cost: number;
  public showView: boolean;
  public formValue: any;
  public balance: number;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {
    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
    // listen to catetory selection (tuition, lunch, etc) from financials-main.component
    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        // Previous seleted category may have set this to true. 
        // Set to false then check for cost and set to true if applicable
        this.costExists = false;
        this.showView = false;
        this.category = x;
        if (this.category) {
          this.costKey = this.category.key + 'Cost';
          this.paymentKey = this.category.key + 'Payment';
          this.deductionKey = this.category.key + 'Deduction'
          this.balanceKey = this.category.key + 'Balance';
          this.checkForCost(this.costKey);
        }

      });
  }

  private checkForCost(costKey) {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[costKey]) {
          this.cost = snapshot.data()[costKey];
          console.log (`this.cost: ${this.cost}`);
          this.costExists = true;
        }
        this.setupFormGroup(this.category); // Do this only after cost state determined.
      }
    );
  }

  private processBalance(key) {
    console.log(`key: ${key}`);
   
    this.currentFinancialDoc.ref.get().then(
      snapshot => {

        if (snapshot.data()[key]) {
          this.balance = snapshot.data()[key];
        }

        if (!this.balance) {

          

          // if (key.includes('tuition')) {
          //   this.balance = this.cost;
          //   console.log(`this.balance: ${this.balance}`);
          // }else{ // Then the category is either Lunch, Ext.Care, or Misc.
          //   this.balance = this.cost; 

          //   // if (this.formValue[this.paymentKey] !== ""){ // Doing a payment or a deduction?
          //   //   this.balance = this.cost + this.formValue[this.paymentKey];
          //   // }
          //   // if (this.formValue[this.deductionKey] !== ""){
          //   //   this.balance = this.cost - this.formValue[this.deductionKey];
          //   // }

          // }

        } else { // a balance exists

          if (key.includes('tuition')) {
            this.balance -= this.formValue[this.paymentKey];
          }else{ // Its not tution so process balance by adding payments and subtracting deductions to existing balance
            if (this.formValue[this.paymentKey] !== ""){
              this.balance += this.formValue[this.paymentKey];
            }
            if (this.formValue[this.deductionKey] !== ""){
              this.balance -= this.formValue[this.deductionKey];
            }
          }


        }
        this.currentFinancialDoc.set({ [this.balanceKey]: this.balance }, { merge: true })
      }
    );
  }

  private setupFormGroup(category: any) {
    // Cost for category does not exist so setup form to
    // provide cost control tied to category.
    if (!this.costExists) {
      this.formGroup = this.fb.group({
        [this.costKey]: ['', Validators.required],
      });
      this.showView = true;
      // Cost exist at this point. 
      // Set up form for a payment field if category is tuition or 
      // payment and deduction fields for other categories.
    } else {
      this.formGroup = this.fb.group({
        [this.paymentKey]: [''],
        [this.deductionKey]: [''] // View will not show this field if category is Tuition
      });
      this.showView = true;
    }
  }

  async submitHandler(formDirective) {
    this.formValue = this.formGroup.value;
    console.log(this.formValue);

    try {

      // Data submitted - if cost doesn't exist, submit cost else submit other values
      if (!this.costExists) {
        // if only use formValue instead of formValue[this.cost], then object will be submitted to DB
        await this.currentFinancialDoc.set({ [this.costKey]: this.formValue[this.costKey] }, { merge: true })
          .then(() => {
            // Will remove section that shows cost form for current category
            this.costExists = true;
            // Update the cost property else cost will show from previously selected category
            this.currentFinancialDoc.ref.get().then(
              snapshot => {
                if (snapshot.data()[this.costKey]) {
                  this.cost = snapshot.data()[this.costKey];
                }
              })
            this.resetForm(formDirective);
          });
      } else {
        let date = new Date();
        // Payments and deductions will be subcollections i.e. lunchPayments, lunchDeductions.  
        // Under the current financial doc, create a payments subcollection based on the current category.
        if (this.formValue[this.paymentKey] !== "") {
          const currentCategorySubcollection = this.currentFinancialDoc.collection(this.category.key + 'Payments'); // creates the subcollection
          // await currentCategorySubcollection.add({ [this.paymentKey]: formValue[this.paymentKey], date: new Date }, { merge: true })
          await currentCategorySubcollection.doc(date.toString()).set({ payment: this.formValue[this.paymentKey], date: new Date })
            .then(_ => {
                this.processBalance(this.balanceKey);
                this.resetForm(formDirective);
              }
            );
        }
        if (this.formValue[this.deductionKey] !== "") {
          const currentCategorySubcollection = this.currentFinancialDoc.collection(this.category.key + 'Deductions'); // creates the subcollection
          //await this.currentFinancialDoc.set({ [this.deductionKey]: formValue[this.deductionKey] }, { merge: true })
          await currentCategorySubcollection.doc(date.toString()).set({ deduction: this.formValue[this.deductionKey], date: new Date })
          .then(_ => {
            this.processBalance(this.balanceKey);
            this.resetForm(formDirective);
          }
        );
        }

      }

    } catch (err) {
      console.log(err);
    }
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
