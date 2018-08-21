import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  public historyTableData: MatTableDataSource<any>;
  public historyTableColumns: string[] = [];

  constructor() { }

  ngOnInit() {

    this.historyTableColumns = ['amount', 'type', 'date', 'memo'];
    this.historyTableData = new MatTableDataSource(this.transactions);
    this.historyTableData.sort = this.sort;

  }

}
