import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../../core/services/financials.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-child-table',
  templateUrl: './child-table.component.html',
  styleUrls: ['./child-table.component.css']
})
export class ChildTableComponent implements OnInit {

  @Input() record;
  @ViewChild(MatSort) sort: MatSort;
  public data: MatTableDataSource<any>;
  public displayedColumnsChildren = ['fname', 'lname', 'grade', 'gender', 'race', 'financials'];

  constructor(private dataService: DataService, private financialsService: FinancialsService, private router: Router) { }

  ngOnInit() {
    this.data = new MatTableDataSource(this.dataService.convertMapToArray(this.record.children));
    this.data.sort = this.sort;
  }

  financials(child) {
    this.financialsService.currentRecord = this.record;
    this.financialsService.createFinancialRecord(child.id);
    this.financialsService.setCurrentChild(child);
    this.router.navigate(['/financials']);
  }

}