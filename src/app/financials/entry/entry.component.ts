import { Component, OnInit} from '@angular/core';
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
  private latestCostSubscription: any;

  public currentFinancialDoc: any;
  public category: any;
  public balanceKey: string;
  public balance: number;
  public formGroup: FormGroup;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
   // console.log(`currentFinacialDoc: ${this.currentFinancialDoc}`);

    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => { // This gets hit upon component load and category selection.
        
        this.category = x;
        
        // Do not do anything until a category is selected.
        if(this.category == null){
          console.log('catgory is null');
          return;
        } 
        // We have a category - proceed.
        console.log('next steps...');

        // Set balance key based on current category
        this.balanceKey = this.category.key + 'Balance';
        // console.log(this.balanceKey);
      

        // Check the DB for a balance key in the currentFinacialDoc.  
        this.currentFinancialDoc.ref.get().then(
          snapshot => {
            if (snapshot.data()[this.balanceKey]) {  // NOTE: Hitting the DB - This may take a second to resolve.
              this.balance = snapshot.data()[this.balanceKey];
              console.log(`this.balance: ${this.balance}`);
            }else{
              console.log('balanceKey does not exist');
            }
          });

        // Setup form - Enter Payment & Enter Charge - applicable to all categories

        // On form submission, if no balance exists, make the initial Balance the amount entered for either Payment or Charge and
        // write to the root of the current financial document.

      })

  }

  ngOnDestroy() {
    if(this.categorySubscription){
      this.categorySubscription.unsubscribe();
    }
    if(this.latestCostSubscription){
      this.latestCostSubscription.unsubscribe();
    }
  }
  
}
