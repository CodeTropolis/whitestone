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
  public startingBalance: number;
  public balanceKey: string;

  public enableCatButtons: boolean;

  public formGroup: FormGroup;
  public formValue: any;
  public formReady: boolean;

  public disableSubmitButton: boolean;

  public userIsAdmin: boolean = false; 
  public userIsSubcriber: boolean = false;


  private chargesCollection: string;
  private paymentsCollection: string;
  
  private subscriptions: any[] = [];

  constructor(private financialsService: FinancialsService, private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit() {

    // Prevent a student's category entry form from showing when 
    // going from financials, to the record list, back to financials
    this.financialsService.currentCategory$.next(null); 

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
          this.balanceKey = cat.key + 'StartingBalance';
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
        } else {
          this.startingBalance = null;
          console.log(`No starting balance present for ${this.currentCategory.val}`)
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
        [this.startingBalanceKey]: this.formValue.amount, [this.startingBalanceDateKey]: this.formValue.date,
        [this.startingBalanceMemoKey]: this.formValue.memo, [this.balanceKey]: this.formValue.amount}, 
        { merge: true }).then( _ => this.resetForm(formDirective))
    }
  
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
