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
  public childrenOfRecord: any[] =[];
  public financialDocExists: boolean = true;
  public currentRecord: any;

  private spinnerSubscribe: any;
  private subscriptions: any[] = [];

  constructor( public dataService: DataService, private financialsService: FinancialsService) { }

  ngOnInit() {

    this.currentRecord = this.dataService.currentRecord;

    this.subscriptions.push(
      this.dataService.currentFinancialDoc$.subscribe(doc => {
        if(doc){
          if(doc.exists){
            //console.log('TCL: CategorySelectComponent -> ngOnInit -> doc.exists', doc.exists);
            this.financialDocExists = true;
          }else{
            this.financialDocExists = false;
            //console.log('TCL: CategorySelectComponent -> ngOnInit -> doc.exists', doc.exists);
          }
        }
      })
    )

    this.dataService.currentChild$.next(null); // Wipe out previously selected student else previous student will show upon entering financials.
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

  // Non admins cannot create a doc and the child's financial doc should already exist prior to 
  // a non-admin user attempting to view.
  public setupFinancialDoc(child){ 
    this.financialsService.currentCategory$.next(null);
    this.dataService.setupFinancialDoc(child);
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
