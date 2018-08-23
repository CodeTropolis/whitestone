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
  public showForm: boolean

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
        
        this.setFormControls(); // Only want this to fire if category is selected.
      });
  }

  // private checkForBalance() {
  //   this.currentFinancialDoc.ref.get().then(
  //     snapshot => {
  //       if (snapshot.data()[this.balanceKey]) {
  //         this.balance = snapshot.data()[this.balanceKey];
  //         console.log(`this.balance: ${this.balance}`);
  //       } else {
  //         console.log('balanceKey does not exist');
  //       }
  //     });
  // }


  private setFormControls() {
    console.log('setFormControls');
    this.formGroup = this.fb.group({
      amount: ['', Validators.required],
      memo: ['', Validators.required],
    });
    this.showForm = true;
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

}
