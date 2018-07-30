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
  public category: string;
  public formGroup: FormGroup;
  // public costExists: boolean[] = [];
  public costExists: boolean;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
    // listen to catetory selection (tuition, lunch, etc) from financials-main.component
    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        this.category = x;
        // Set up object keys (based on current category) to send to DB.
        if (this.category) {
         // console.log(`category: ${this.category}`);
          this.costKey = this.category + 'Cost';
          this.paymentKey = this.category + 'Payment';
          this.deductionKey = this.category + 'Deduction'
          this.balanceKey = this.category + 'Balance';

          this.checkForCost(this.costKey);
        }

      });
  }

  private checkForCost(costKey) {
    //console.log(`in checkForCost - costKey: ${costKey}`);
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[costKey]) {
          //console.log(`Cost for ${costKey}: ${snapshot.data()[costKey]}`);
          this.costExists = true;
          //console.log(`costExists: ${this.costExists[this.category]}`);
        } else {
          //console.log(`Cost for ${costKey} does not exist`);
          this.costExists = false;
          // console.log(`costExists: ${this.costExists[this.category]}`);
        }
        this.setupFormGroup(this.category); // Do this only after cost state determined.
      }
    );
  }

  private setupFormGroup(cat: string) {

    if (!this.costExists) { // Cost for category does not exist so form provides cost control based on category.
      //console.log(`In setupFormGroup - costExist: ${this.costExists}`)
      this.formGroup = this.fb.group({
        [this.costKey]: ['', Validators.required],
      });
    }else{
      console.log('setup payment and deduction form controls');
    }

    // if (!this.costExists) { // Cost for category does not exist so form provides cost control based on category.
    //   //console.log(`In setupFormGroup - costExist: ${this.costExists}`)
    //   this.formGroup = this.fb.group({
    //     [this.costKey]: ['', Validators.required],
    //   });
    // } else { // Cost exist at this point. Now set up form for a payment field for tuition and payment and deduction fields for other categories.
    //   if (cat === 'tuition') {
    //     this.formGroup = this.fb.group({
    //      [this.paymentKey]: ['', Validators.required], // For tuition, payments deduct from starting cost/balance
    //     });
    //   } else {
    //     this.formGroup = this.fb.group({
    //       [this.paymentKey]: [''], // For all other categories, payment will add to starting amount
    //       [this.deductionKey]: ['']
    //     });
    //   }
    // }

  }

  async submitHandler(formDirective) {
    const formValue = this.formGroup.value;
    try {
      // if only use formValue instead of formValue[this.cost], then object will be submitted to DB
      await this.currentFinancialDoc.set({ [this.costKey]: formValue[this.costKey] }, { merge: true })
        .then(() => {
          this.costExists = true;
          this.resetForm(formDirective);
        });
    } catch (err) {
      console.log(err);
    }

  }

  private resetForm(formDirective) {
    formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.formGroup.reset();
  }

  ngOnDestroy() {
    this.categorySubscription.unsubscribe();
  }

}
