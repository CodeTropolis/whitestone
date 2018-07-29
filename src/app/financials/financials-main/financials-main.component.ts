import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';

@Component({
  selector: 'app-financials-main',
  templateUrl: './financials-main.component.html',
  styleUrls: ['./financials-main.component.css']
})
export class FinancialsMainComponent implements OnInit {

  public currentSurname: string;
  public currentEmail: string;
  public currentChild: any;
  public categories: any;

  constructor(
    private ds: DataService,
    private financialsService: FinancialsService,
  ) { }

  ngOnInit() {
    this.currentSurname = this.ds.currentRecord.surname;
    this.currentEmail = this.ds.currentRecord.email;
    this.currentChild = this.ds.currentChild;
    this.categories = this.financialsService.categories;
  }

  public setCategory(cat: string) {
    this.financialsService.currentCategory$.next(cat);
  }

}
