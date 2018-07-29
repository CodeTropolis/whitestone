import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../../core/services/firebase.service';
import { RecordService } from '../record.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent implements OnInit {

  private recordsSubscription: any;
  public records: any[] = [];
  public isUpdating: boolean;
  public ds: MatTableDataSource<any>;
  public displayedColumns = ['surname',  'email', 'district', 'catholic',];
  public showChildren: boolean[] = [];
  public isDeleting: boolean[] =[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
  private fs: FirebaseService, 
  private res: RecordService,
  private route: ActivatedRoute
  ) { }

  ngOnInit() {
 
    this.recordsSubscription = this.fs.records$.subscribe(x => {
    
      this.records = x;
      this.ds = new MatTableDataSource(this.records);

      this.ds.filterPredicate = (data, filter) => {
        let dataStr = data.surname + data.email + data.district + data.catholic;
        data.children.forEach(child => dataStr += (child.fname + child.lname + child.gender + child.grade + child.race));
        dataStr = dataStr.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        return dataStr.indexOf(filter) != -1;
      }

      this.ds.paginator = this.paginator;
      this.ds.sort = this.sort;
    });

    // Get state from service for button state: disable upon edit.
    this.res.isUpdating$.subscribe(x => this.isUpdating = x);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase(); 
    this.ds.filter = filterValue;
    if (this.ds.paginator) {
      this.ds.paginator.firstPage();
    }
  }

  public prepFormToUpdate(record) {
    this.res.prepFormToUpdate(record);
  }

   public aboutToDelete(row) {
    this.isDeleting[row.realId] = !this.isDeleting[row.realId];
  }

  public deleteRecord(record) {
    this.res.deleteRecord(record);
  }

  onRowClicked(row) {
    this.showChildren[row.realId] = !this.showChildren[row.realId];
  }

  ngOnDestroy() {
    this.recordsSubscription.unsubscribe();
  }

}