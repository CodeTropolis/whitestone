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
  // public costExists: boolean[] = [];
  public costExists: boolean;
  public showView:boolean;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
    // listen to catetory selection (tuition, lunch, etc) from financials-main.component
    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        this.showView = false;
        this.category = x;
        // Set up object keys (based on current category) to send to DB.
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
          this.costExists = true;
        } else {
          this.costExists = false;
        }
        this.setupFormGroup(this.category); // Do this only after cost state determined.
      }
    );
  }

  private setupFormGroup(category: any) {
    console.log(`category.key == ${category.key}`)
    if (!this.costExists) { // Cost for category does not exist so setup form to provide cost control tied to category.
      this.formGroup = this.fb.group({
        [this.costKey]: ['', Validators.required],
      });
      this.showView = true;
    } else { // Cost exist at this point. Set up form for a payment field if category = tuition or payment and deduction fields for other categories.
      if (category.value === 'Tuition') {
        this.formGroup = this.fb.group({
          [this.paymentKey]: ['', Validators.required]
        });
        this.showView = true;
      } else {
        console.log(`setup payment/deductions controls`);
        this.formGroup = this.fb.group({
          [this.paymentKey]: [''], 
          [this.deductionKey]: ['']
        });
        this.showView = true;
      }
    }
  }

  async submitHandler(formDirective) {
    const formValue = this.formGroup.value;
    try {
      // if only use formValue instead of formValue[this.cost], then object will be submitted to DB
      await this.currentFinancialDoc.set({ [this.costKey]: formValue[this.costKey] }, { merge: true })
        .then(() => {
          this.costExists = true; // Will remove section that shows cost form for current category
          this.resetForm(formDirective);
          this.setupFormGroup(this.category);
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
