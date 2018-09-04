import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  private transactionSubscription: any;
  public transactions: any[] = [];
  public currentCatgory: any;

  private balanceKey: string;
  private currentFinancialDoc: any;

 @ViewChild(MatSort) sort: MatSort;
  public tableData: MatTableDataSource<any>;
  public tableColumns = ['amount', 'type', 'date', 'memo', 'delete'];
  public isReady: boolean;

  constructor(private dataService: DataService, private financialsService: FinancialsService) { }

  ngOnInit() {

    this.financialsService.currentCategory$.subscribe(cat => this.currentCatgory = cat);

    this.dataService.currentFinancialDoc$.subscribe(payload => this.currentFinancialDoc = payload);

    this.balanceKey = this.currentCatgory.key + 'Balance';

    this.transactionSubscription = this.dataService.transactions$.subscribe(x => { 
      
      this.tableData = new MatTableDataSource(x);
      // this.ds.paginator = this.paginator;
      this.tableData.sort = this.sort;
    });

  }

  deleteTransaction(row: any, type: string, amount:number){
    
    let currentBalance: number;
    this.financialsService.runningBalanceForCurrentCategory$.subscribe(currBal => currentBalance = currBal);

    let updatedBalance: number = null;
    type  === 'Payment' ? updatedBalance = currentBalance + amount : updatedBalance = currentBalance - amount;

    if (updatedBalance){
      this.financialsService.runningBalanceForCurrentCategory$.next(updatedBalance);
      console.log('TCL: HistoryComponent -> this.balanceKey', this.balanceKey);
      // Update the DB
     this.currentFinancialDoc.set({ [this.balanceKey]: updatedBalance }, { merge: true })
      
    }
  }

  ngOnDestroy(){
    this.transactionSubscription.unsubscribe();
  }
}
