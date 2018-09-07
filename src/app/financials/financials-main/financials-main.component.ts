import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../../core/services/financials.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-financials-main',
  templateUrl: './financials-main.component.html',
  styleUrls: ['./financials-main.component.css']
})
export class FinancialsMainComponent implements OnInit {

  public currentUser$: Observable<any>;
  public currentChild: any;
  //public currentSurname$: Observable<any>;
  //public currentSurname: string;
  public currentChildSubscription: any;
  public categories: any;
  public showAvatarSpinner: boolean;

  private spinnerSubscribe: any;

  constructor(private financialsService: FinancialsService,private authService: AuthService) { }

  ngOnInit() {

    // Get the current user from the service and set to async in view
    this.currentUser$ = this.authService.authState;

    //ToDo: Need reference to family record for UI showing other children of record.

    this.currentChildSubscription = this.financialsService.currentChild$.subscribe(child => this.currentChild = child);

    console.log('TCL: FinancialsMainComponent -> ngOnInit -> this.currentChild', this.currentChild);
    this.categories = this.financialsService.categories;
    this.spinnerSubscribe = this.financialsService.showAvatarSpinner$.subscribe(x => this.showAvatarSpinner = x)
  };

  public setCategory(cat: string) {
    this.financialsService.currentCategory$.next(cat);

    // Moved this.financialsService.showAvatarSpinner$.next(true);  to here instead of 
    // beginning of entry.component to prevent  "Expression has changed after it was checked" err.
    this.financialsService.showAvatarSpinner$.next(true); // show avatar spinner while entry.component goes through its setup 
    // entry.component will set this to false at some point.
  }

  public logOut() {
    this.authService.logOut('');
  }

  ngOnDestroy() {
    if(this.spinnerSubscribe){
      this.spinnerSubscribe.unsubscribe();
    }
    this.currentChildSubscription.unsubscribe();
    this.financialsService.currentCategory$.next(null); // Clear out the current category else next selected child's financials will start out with previously selected category.
    
  }

}
