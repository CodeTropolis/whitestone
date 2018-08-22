import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-financials-main',
  templateUrl: './financials-main.component.html',
  styleUrls: ['./financials-main.component.css']
})
export class FinancialsMainComponent implements OnInit {

  public currentUser$: Observable<any>;
  public currentSurname: string;
  public currentEmail: string;
  public currentChild: any;
  public categories: any;
  public showAvatarSpinner: boolean;

  private catSubscribe:any;

  constructor(
    private ds: DataService,
    private financialsService: FinancialsService,
    private authService: AuthService
  ) { }

  ngOnInit() {

      // Get the current user from the service and set to async in view
      this.currentUser$ = this.authService.authState;

    this.currentSurname = this.ds.currentRecord.surname;
    this.currentEmail = this.ds.currentRecord.email;
    this.currentChild = this.ds.currentChild;
    this.categories = this.financialsService.categories;
    this.catSubscribe = this.financialsService.showAvatarSpinner$.subscribe( x => {
      this.showAvatarSpinner = x;
      //console.log(`this.avatarSpinner: ${this.showAvatarSpinner}`);
      })
    };

  public setCategory(cat: string) {
    this.financialsService.currentCategory$.next(cat);
  }

  public logOut() {
    this.authService.logOut('');
  }

  ngOnDestroy(){
    this.catSubscribe.unsubscribe();
  }

}
