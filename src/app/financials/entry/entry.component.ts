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

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

   ngOnInit() {

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {                                   // This gets hit upon component load and category selection.
        console.log('in subscribe')
        this.category = x;
        if (this.category == null) {
          console.log('catgory is null');
          return;                                         // Because the body of the subscribe is ran on init(why?), 
                                                          // make sure nothing happens until a category is selected.
        }
                                                          // We have a category - proceed.
        this.balanceKey = this.category.key + 'Balance'; 
        this.checkForBalance().then(x => {
          console.log(x);
        });
      })
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

  private async checkForBalance() {
    const snapshot = await this.currentFinancialDoc.ref.get()
    if (snapshot.data()[this.balanceKey]) { 
      return snapshot.data()[this.balanceKey];
    } else {
      console.log('balanceKey does not exist');
      return false;
    }
  }

  private setFormControls() {
    console.log('setFormControls');
    this.formGroup = this.fb.group({
      amount: ['', Validators.required],
      memo: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

}
