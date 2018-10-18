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
  public data: MatTableDataSource<any>;
  public displayedColumnsChildren = ['fname', 'lname', 'grade', 'gender', 'race', 'financials'];

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    this.data = new MatTableDataSource(this.dataService.convertMapToArray(this.record.children));
    this.data.sort = this.sort;
  }

  financials(child) { // Pass in the specific child.  A record may contain multple children.
    console.log('TCL: ChildTableComponent -> financials -> child', child);
    // Why are these services in data.service instead of financial.service?
    // A: the child-table.component, which is outside of the financials module, sets these values.
    this.dataService.setFinancialDoc(child.id);
    this.dataService.setCurrentChild(child); // Future: UI element to select another child within same parent record, say on financials component.
    this.router.navigate(['/financials']);
  }

}