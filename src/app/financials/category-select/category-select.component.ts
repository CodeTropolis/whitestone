import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.css']
})
export class CategorySelectComponent implements OnInit {

  public currentChild: any;
  public currentChildSubscription: any;
  public categories: any;
  public showAvatarSpinner: boolean;
  public user$: Observable<any>;
  public financialDocExists: boolean;
  public childrenOfRecord: any[] =[];

  private spinnerSubscribe: any;
  private subscriptions: any[] = [];

  constructor(private authService: AuthService, private dataService: DataService, private financialsService: FinancialsService) { }

  ngOnInit() {

    this.childrenOfRecord = this.dataService.childrenOfRecord;
    this.categories = this.financialsService.categories;
    this.currentChildSubscription = this.dataService.currentChild$.subscribe(child => this.currentChild = child);
    this.spinnerSubscribe = this.financialsService.showAvatarSpinner$.subscribe(x => this.showAvatarSpinner = x)
  };

  public setCategory(cat: any) {
    this.financialsService.setCategoryAndStrings(cat);
    // Moved this.financialsService.showAvatarSpinner$.next(true);  to here instead of 
    // beginning of entry.component to prevent "Expression has changed after it was checked" err.
    this.financialsService.showAvatarSpinner$.next(true); // show avatar spinner while entry.component goes through its setup 
    // entry.component will set this to false at some point.

  }

  public createFinancialDoc(child){
    this.dataService.createFinancialDoc(child);
  }

  ngOnDestroy() {
    if (this.spinnerSubscribe) {
      this.spinnerSubscribe.unsubscribe();
    }
    this.currentChildSubscription.unsubscribe();
    // Clear out the current category else next selected child's financials will start out with previously selected category.
    this.financialsService.currentCategory$.next(null);

    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });


  }

}
