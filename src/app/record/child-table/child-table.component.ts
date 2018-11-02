import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { DataService } from '../../core/services/data.service';
//import { Router } from '@angular/router';

@Component({
  selector: 'app-child-table',
  templateUrl: './child-table.component.html',
  styleUrls: ['./child-table.component.css']
})
export class ChildTableComponent implements OnInit {

  @Input() record;
  @ViewChild(MatSort) sort: MatSort;
  public children: MatTableDataSource<any>;
  public displayedColumnsChildren = ['fname', 'lname', 'grade', 'gender', 'race', 'financials'];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.children = new MatTableDataSource(this.dataService.convertMapToArray(this.record.children));
    this.children.sort = this.sort;
  }

  public financials(child) { // Pass in the specific child. A record may contain multiple children
    this.dataService.createFinancialDoc(child, '/financials');
    //this.router.navigate(['/financials']); // Need to wait until financial doc is created and observble set because entry.component subscribes currentFinancialDoc$
  }

}