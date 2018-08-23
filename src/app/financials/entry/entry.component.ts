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
  public balanceKey: string;
  public balance: number;
  public formGroup: FormGroup;
  public showForm: boolean;
  public isEnteringPayment:boolean;
  public isEnteringCharge:boolean;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

   ngOnInit() {

    this.showForm = false;
    
    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {                                  
        
        this.category = x;
         // Because the body of the subscribe is ran on init(why?), 
         // make sure nothing happens until a category is selected.
        if (this.category == null) {return}

        this.balanceKey = this.category.key + 'Balance'; 
        
        this.checkForBalance();

        this.setFormControls(); // Only want this to fire if category is selected.
      });
  }

  // 1) Check for balance. Submit handler flow determined by presence of balance i.e.
  //    if no balance, post either payment or charge as balance.
  private checkForBalance() {
    this.currentFinancialDoc.ref.get().then(
      snapshot => {
        if (snapshot.data()[this.balanceKey]) {
          this.balance = snapshot.data()[this.balanceKey];
          // console.log(`this.balance: ${this.balance}`);
        } else {
          // console.log('balanceKey does not exist');
          this.balance = null; 
        }

      });
  }

  private setFormControls() {
    //console.log('setFormControls');
    this.formGroup = this.fb.group({
      amount: ['', Validators.required],
      memo: ['', Validators.required],
    });
  }

  public enterPayment(){
    this.isEnteringPayment = true;
    this.isEnteringCharge = false;
    this.showForm = true;
  }

  public enterCharge(){
    this.isEnteringPayment = false;
    this.isEnteringCharge = true;
    this.showForm = true;
  }

  public submitHandler(){
    // 2) If no balance, save either payment or charge as balance to currentFinancialDoc 
    if(!this.balance){
      console.log(`${this.category.val} does not have a balance`);
      if(this.isEnteringPayment){
        this.currentFinancialDoc.set({ [this.balanceKey]: this.formGroup[amount] }, { merge: true }) 
      }
      if(this.isEnteringCharge){

      }
    // 3) If balance, add/subtract payment or charge from balance contained in currentFinancialDoc
    // At this point, this.balance has already been set by the checkForBalance() method
    }else{
      console.log(`${this.category} balance: ${this.balance}`);
     
    }
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

}
