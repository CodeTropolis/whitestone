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
  public formGroup: FormGroup;

  constructor(private financialService: FinancialsService, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit() {

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
   // console.log(`currentFinacialDoc: ${this.currentFinancialDoc}`);

    this.categorySubscription = this.financialService.currentCategory$
      .subscribe(x => {
        
        this.currentCategory = x;
        
        // Do not do anything until a category is selected.
        if(this.currentCategory == null){
          console.log('catgory is null');
          return;
        } 
        // Else we have a catogory - proceed.
        console.log('next steps...');
      })

  }

  ngOnDestroy(){
    if(this.categorySubscription){
      //this.categorySubscription.unsubcribe();
    }
  }
  
}
