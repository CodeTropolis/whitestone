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

  // public currentFinancialDoc: any;
  // // public transactions: any[] = [];
  // public category: any; // Object

  //  private sort: MatSort;
  // @ViewChild(MatSort) set content(c: MatSort) {
  //   this.sort = c;
  //   console.log(`this.sort: ${this.sort}`);
  // }

  private transactionSubscription: any;
  public transactions: any[] = [];

 @ViewChild(MatSort) sort: MatSort;
  public tableData: MatTableDataSource<any>;
  public tableColumns = ['amount', 'type', 'date', 'memo'];

  // private startingCostCollection: string;
  // private paymentsCollection: string;
  // private deductionsCollection: string;

  public isReady: boolean;

  constructor(private dataService: DataService, private financialsService: FinancialsService) { }

  ngOnInit() {

    this.transactionSubscription = this.dataService.transactions$.subscribe(x => { // unsubscribe onDestroy
      console.log(`transactions$.subscribe payload: ${x}`)
      this.tableData = new MatTableDataSource(x);

      // this.ds.filterPredicate = (data, filter) => {
      //   let dataStr = data.surname + data.email + data.seconaryEmail + data.district + data.catholic;
      //   const children = this.dataService.convertMapToArray(data.children);
      //   children.forEach(child => dataStr += (child.fname + child.lname + child.gender + child.grade + child.race));
      //   dataStr = dataStr.toLowerCase(); // MatTableDataSource defaults to lowercase matches
      //   return dataStr.indexOf(filter) != -1;
      // }

      // this.ds.paginator = this.paginator;
      this.tableData.sort = this.sort;
    });

    // this.isReady = false;

    // this.currentFinancialDoc = this.dataService.currentFinancialDoc;
    // this.dataService.category$.subscribe(x => this.category = x);
    // this.dataService.paymentsCollection$.subscribe(x => this.paymentsCollection = x);
    // this.dataService.deductionsCollection$.subscribe(x => this.deductionsCollection = x);

    // Clear out array else view will aggregate - will repeat array for each entry.
   // this.transactions = [];

    // this.dataService.transactions$.subscribe(x => {
    //   this.transactions = x
    //   console.log(`In history.component - this.transactions: ${this.transactions}`);
    //   this.tableData = new MatTableDataSource(this.transactions);
    // });

    // this.tableColumns = ['amount', 'type', 'date', 'memo'];
    // this.tableData.sort = this.sort;
   

    // this.currentFinancialDoc.collection(this.paymentsCollection).ref.get()
    //   .then(snapshot => {
    //     snapshot.forEach(
    //       item => {
    //         let date = item.data().date.toDate();
    //         const type = this.category.key === 'tuition' ? "Payment" : "Credit"
    //         this.transactions.push({ amount: item.data().payment, type: type, date: date, memo: item.data().memo });
    //         //this.dataService.transactions$.next(this.transactions);
    //         //console.log(`In history.component - this.transactions: ${this.transactions}`);
    //       }
    //     )

    //     this.currentFinancialDoc.collection(this.deductionsCollection).ref.get()
    //     .then(snapshot => {
    //       snapshot.forEach(
    //         item => {
    //           let date = item.data().date.toDate();
    //           this.transactions.push({ amount: item.data().deduction, type: "Deduction", date: date, memo: item.data().memo });
    //          // this.dataService.transactions$.next(this.transactions);
    //           //console.log(`In history.component - this.transactions: ${this.transactions}`);
    //         }
    //       )
    //       this.setupTable();
    //     });

    //   });



  }

  // private setupTable(){
  //   this.isReady = true;
  //   // console.log(`In history.component - this.transactions: ${this.transactions}`);
  //  // this.tableColumns = ['amount', 'type', 'date', 'memo'];
  //   this.tableData = new MatTableDataSource(this.transactions);
  //   // console.log(`In history.component - tableData: ${this.tableData}`);
  //   console.log(`In history.component - this.sort: ${this.sort}`);
  //   this.tableData.sort = this.sort;

  // }

}
