import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';

@Component({
  selector: 'app-entry-category',
  templateUrl: './entry-category.component.html',
  styleUrls: ['./entry-category.component.css']
})
export class EntryCategoryComponent implements OnInit {

  public categories: any[] =[];
  public currentCategory: string;

  public startingBalanceKey: string;
  public startingBalanceDateKey: string;
  public startingBalanceMemoKey: string;
  public startingBalance: number;
  public balanceKey: string;

  private paymentsCollection: string;
  private chargesCollection: string;

  constructor(private financialsService: FinancialsService) { }

  ngOnInit() {
    this.categories = this.financialsService.categories;
  }

  public setCategoryAndFinancialDocPropsAndCollections(category){
    this.currentCategory = category;
  }

}
