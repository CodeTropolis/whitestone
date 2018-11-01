import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../../core/services/firebase.service';
import { RecordService } from '../record.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/user';
import { ModalService } from '../../modal/modal.service';

@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent implements OnInit {

  public isUpdating: boolean;
  public ds: MatTableDataSource<any>;
  public displayedColumns = ['surname', 'father', 'mother', 'actions'];
  public showChildren: boolean[] = [];
  public isDeleting: boolean[] = [];
  public showForm: boolean;

  public user: User;
  public userIsAdmin: boolean = false;  // for view
  public userIsSubcriber: boolean = false;
  public recordMatch: boolean;

  public currentRecord: any; // For modal

  private subscriptions: any[] = [];
  private matchingRecords: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private fs: FirebaseService,
    private res: RecordService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService,
    private modalService: ModalService,
  ) { }

  ngOnInit() {

    // Why subscribe?  User is never changed once logged in.
    // Because user data may be retrieved in time.

    this.subscriptions.push(
      this.authService.userIsAdmin$.subscribe(x => {
        this.userIsAdmin = x;
      })
    );

    this.subscriptions.push(
      this.authService.userIsSubcriber$.subscribe(x => {
        this.userIsSubcriber = x;
      })
    )

    // if(this.authService.user['roles'].admin){
    //   this.userIsAdmin = true;
    // }


    // if(this.authService.user['roles'].subscriber){
    //   this.userIsSubcriber = true;
    // }

    this.subscriptions.push(
      this.fs.records$.subscribe(x => {
        //The admin will always have subscriber:true so filter out the admin user
        if (this.userIsSubcriber && !this.userIsAdmin) {
          // Do not do record match logic if user is admin. 
          console.log('User is a subscriber')
          x.forEach(record => {
            if (record.fatherEmail === this.authService.user.email || record.motherEmail === this.authService.user.email) {
              // console.log('TCL: RecordListComponent -> ngOnInit -> record.motherEmail', record.motherEmail);
              // console.log('TCL: RecordListComponent -> ngOnInit -> record.fatherEmail', record.fatherEmail);

              this.matchingRecords.push(record);
              //console.log('Matched doc: ', record);
              this.ds = new MatTableDataSource(this.matchingRecords); // data source must be an arrray.
              this.recordMatch = true;

              // Simply 'else' will not work as the a document that does not match will still be evaluated and the following would execute.
            }
            // else if (this.matchingRecords.length < 1 ){ 
            //   console.log(`No matching records`); // this fires even when records match...?
            //   this.recordMatch = false;
            // }
          })
        } else if (this.userIsAdmin) {
          this.ds = new MatTableDataSource(x);
          console.log('User is admin');
        }

        if (this.ds) { // Prevent error in console if no records.
          this.ds.filterPredicate = (data, filter) => {
            let dataStr = data.surname + data.fatherFname + data.fatherLname + data.motherFname + data.motherLname + data.district + data.catholic;
            const children = this.dataService.convertMapToArray(data.children);
            children.forEach(child => dataStr += (child.fname + child.lname + child.gender + child.grade + child.race));
            dataStr = dataStr.toLowerCase(); // MatTableDataSource defaults to lowercase matches
            return dataStr.indexOf(filter) != -1;
          }

          this.ds.paginator = this.paginator;
          this.ds.sort = this.sort;
        }


      })
    )

    // Get state from service for button state: disable upon edit.
    this.subscriptions.push(this.res.isUpdating$.subscribe(x => this.isUpdating = x));
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
    this.showForm = true;
    setTimeout(() => this.res.prepFormToUpdate(record), 250); // Give form a chance to load prior to populating
  }

  public aboutToDelete(row) {
    this.isDeleting[row.realId] = !this.isDeleting[row.realId];
  }

  public deleteRecord(record) {
    this.res.deleteRecord(record);
  }

  public setCurrentRecord(record){
    this.dataService.setCurrentRecord(record);
  }

  onRowClicked(row) {
    this.showChildren[row.realId] = !this.showChildren[row.realId];
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  // Family Record Modal
  openModal(id: string, record) {
    this.currentRecord = record;
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}