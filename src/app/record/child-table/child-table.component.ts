import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { DataService } from '../../core/services/data.service';
import { Router } from '@angular/router';

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

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    this.children = new MatTableDataSource(this.dataService.convertMapToArray(this.record.children));
    this.children.sort = this.sort;
  }

  financials(child) { // Pass in the specific child. A record may contain multiple children
    // Pass in children in order to obtain a list of 
    // available children in order to switch child in financials component.
    this.dataService.setFinancialDoc(child.id, this.record); // Pass in current record in order to update financial doc with father and/or mother email addresses.
    this.dataService.setCurrentChild(child);
    // Pass a list of available children (within same record) for other UIs i.e. select another child on financials
    this.dataService.childrenOfRecord = this.dataService.convertMapToArray(this.record.children); 
    this.router.navigate(['/financials']);
  }

}