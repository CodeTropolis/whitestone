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
  public currentCategory: any;
  public balanceKey: string;
  public formGroup: FormGroup;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
   // console.log(`currentFinacialDoc: ${this.currentFinancialDoc}`);

    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => { // This gets hit upon component load and category selection.
        
        this.currentCategory = x;
        
        // Do not do anything until a category is selected.
        if(this.currentCategory == null){
          console.log('catgory is null');
          return;
        } 
        // We have a category - proceed.
        console.log('next steps...');

        // Set balance key based on current category
        this.balanceKey = this.currentCategory.key + 'Balance';
        console.log(this.balanceKey);
      

        // Check the DB for a balance key in the currentFinacialDoc.  

        // Setup form - Enter Payment & Enter Charge - applicable to all categories

        // If no balance exists, make the initial Balance the amount entered for either Payment or Charge and
        // write to the root of the current financial document.




      })

  }

  ngOnDestroy(){
    if(this.categorySubscription){
      //this.categorySubscription.unsubcribe();
    }
  }
  
}
