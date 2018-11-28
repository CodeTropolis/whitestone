import { Component, OnInit, ViewChild } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { BehaviorSubject } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  private subscriptions: any[] = [];

  public userIsAdmin: boolean = false;
  public userIsSubcriber: boolean = false;

  public currentFinancialDoc: any;
  public currentCategory: string;
  public currentChild: string;
  public runningBalanceKey: string;
  private chargesCollection: string;
  private paymentsCollection: string;
  public transactions$: BehaviorSubject<any[]>;

  public tableData: MatTableDataSource<any>;
  public tableColumns;
  @ViewChild(MatSort) sort: MatSort;

  public disableDelete: boolean[] = [];

  private runningBalance: number;
  private updatedBalance: number;

  constructor(private financialsService: FinancialsService, private authService: AuthService) { }

  ngOnInit() {

    this.subscriptions.push(
      this.authService.userIsAdmin$.subscribe(x => {
       this.userIsAdmin = x;
     } )
   );

   this.subscriptions.push(
     this.authService.userIsSubcriber$.subscribe(x => {
       this.userIsSubcriber = x;
     })
   )

   if(this.userIsAdmin){
    this.tableColumns = ['amount', 'type', 'date', 'memo', 'delete'];
   }else{
    this.tableColumns = ['amount', 'type', 'date', 'memo'];
   }

    // currentFinancialDoc$ next'd by student-select.component
    this.subscriptions.push(
    this.financialsService.currentFinancialDoc$.subscribe(doc =>{ 
      if(doc){
        this.currentFinancialDoc = doc;
        this.currentChild = this.currentFinancialDoc.data().childFirstName + ' ' + this.currentFinancialDoc.data().childLastName;
      }
    })
  );

    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        if(cat){
          this.currentCategory = cat.val;
          this.runningBalanceKey = cat.key + 'RunningBalance';
          this.chargesCollection = cat.key + 'Charges';
          this.paymentsCollection = cat.key + 'Payments';
          this.runningBalance = this.currentFinancialDoc.data()[this.runningBalanceKey]; // get the running balance of the current category  
					console.log(`runningBlanceKey: ${this.runningBalanceKey} | Running Balance: ${this.runningBalance}`);
        }
      })
    );

    this.financialsService.transactions = [];
    this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
    this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);
    
    this.financialsService.transactions$.subscribe(x => {
      if (x) {
        this.tableData = new MatTableDataSource(x);
        this.tableData.sort = this.sort;
      } else {
       console.log(`Table data issue with: ${x}`)
      }
    });

  } // end init()

  public deleteTransaction(id: string, type: string, amount: number) {
    
    this.disableDelete[id] = true; // Prevent user from entering delete multiple times for a row.

    type === 'Payment' ? this.updatedBalance = (this.runningBalance + amount) : this.updatedBalance = (this.runningBalance - amount);

    // Update the running balance in the DB
    // Issue with running balance being passed a NaN
    this.currentFinancialDoc.ref.set({ [this.runningBalanceKey]: this.updatedBalance }, { merge: true })
      .then(_ => { 
        this.financialsService.runningBalanceForCurrentCategory$.next(this.updatedBalance); // For entry.component to show Running Balance
        // Update history table data.
        this.financialsService.transactions = [];
        this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);
        this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
      });

    
    // Delete the subcollection that is the payment or charge being deleted.
    // Are we dealing with the payments or charges subcollection?
    let collection: string;
    type === 'Payment' ? collection = this.paymentsCollection : collection = this.chargesCollection;



    // this.currentFinancialDoc.ref.collection(collection).doc(id).delete()
    //   .then(_ => {
    //     console.log('TCL: HistoryComponent -> deleteTransaction -> id', id, 'Amount:', amount);
    //     // Update the DB
    //     // Issue with running balance being passed a NaN
    //     this.currentFinancialDoc.ref.set({ [this.runningBalanceKey]: this.updatedBalance }, { merge: true })
    //       .then(_ => { 
    //         this.financialsService.runningBalanceForCurrentCategory$.next(this.updatedBalance); // For entry.component to show Running Balance
    //         // Update history table data.
    //         this.financialsService.transactions = [];
    //         this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);
    //         this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
    //       })
    //   });

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
