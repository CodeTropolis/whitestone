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

 @ViewChild(MatSort) sort: MatSort;
  public tableData: MatTableDataSource<any>;
  public tableColumns = ['amount', 'type', 'date', 'memo'];
  public isReady: boolean;

  constructor(private dataService: DataService, private financialsService: FinancialsService) { }

  ngOnInit() {

    this.transactionSubscription = this.dataService.transactions$.subscribe(x => { // unsubscribe onDestroy
      
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

  }

  ngOnDestroy(){
    this.transactionSubscription.unsubscribe();
  }
}
