import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FirebaseService } from "../../core/services/firebase.service";
import { RecordService } from "../../core/services/record.service";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { DataService } from "../../core/services/data.service";
import { AuthService } from "../../core/services/auth.service";
import { ModalService } from "../../modal/modal.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable, combineLatest, of } from "rxjs"; // combineLatest works with this import only.
import { map, switchMap } from "rxjs/operators";


@Component({
  selector: "app-record-list",
  templateUrl: "./record-list.component.html",
  styleUrls: ["./record-list.component.css"]
})
export class RecordListComponent implements OnInit {
  public user: any;
  public records$: Observable<any[]>;
  public isUpdating: boolean;
  public ds: MatTableDataSource<any>;
  public displayedColumns;
  public showChildren: boolean[] = [];
  public isDeleting: boolean[] = [];
  public showForm: boolean;
  public recordMatch: boolean;

  // For modal
  public currentRecord: any;
  public modalTableDataSource: MatTableDataSource<any>;
  public displayedColumnsModal = [
    "fatherEmail",
    "motherEmail",
    "address",
    "catholic"
  ];

  private subscriptions: any[] = [];

  //@ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  // Prevent sort from undefined
  // https://stackoverflow.com/a/51084166
  private sort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.ds.sort = this.sort;
      this.ds.paginator = this.paginator;
    }
  }

  constructor(
    private fs: FirebaseService,
    private res: RecordService,
    private dataService: DataService,
    private authService: AuthService,
    private modalService: ModalService,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {

    this.ds = null;

    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
          this.user = user; // Custom user object.
          if (user.roles.admin) {
            this.getAllRecords();
          } else {
            this.getMatchingRecords();
          }
      })
    );

    // Get state from service for button state: disable upon edit.
    this.subscriptions.push(
      this.res.isUpdating$.subscribe(x => (this.isUpdating = x))
    );
  }

  private getAllRecords() {
    this.displayedColumns = ["fatherLname", "motherLname", "actions"];

    this.records$ = this.fs.records$;

    this.subscriptions.push(
      this.records$.subscribe(records => {
        this.ds = new MatTableDataSource(records);

        this.ds.filterPredicate = (data, filter) => {
          let dataStr =
            data.surname +
            data.fatherFname +
            data.fatherLname +
            data.motherFname +
            data.motherLname;
          const children = this.dataService.convertMapToArray(data.children);
          children.forEach(
            child =>
              (dataStr +=
                child.fname +
                child.lname +
                child.gender +
                child.grade +
                child.race)
          );
          dataStr = dataStr.toLowerCase(); // MatTableDataSource defaults to lowercase matches
          return dataStr.indexOf(filter) != -1;
        };
      })
    );
  }

  private getMatchingRecords() {

    this.displayedColumns = ["surname", "actions"];

      const matchFatherEmail = this.afs.collection("records", ref => ref.where("fatherEmail", "==", this.user.email));
      const matchMotherEmail = this.afs.collection("records", ref =>ref.where("motherEmail", "==", this.user.email));

      this.records$ = combineLatest(matchFatherEmail.valueChanges(), matchMotherEmail.valueChanges())
      .pipe(map(([fathers, mothers]) => {
          if(fathers.length || mothers.length != 0) {
            this.recordMatch = true;
            return [...fathers, ...mothers];
          } else {
            this.recordMatch = false;
          }
        })
      );

      this.subscriptions.push(
        this.records$.subscribe(records => {
          this.ds = new MatTableDataSource(records);
          this.ds.paginator = this.paginator;
          this.ds.sort = this.sort;
        })
      );
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
    this.modalService.open('record-entry-modal');
    setTimeout(() => this.res.prepFormToUpdate(record), 250); // Give form a chance to load prior to populating
  }

  public aboutToDelete(row) {
    this.isDeleting[row.realId] = !this.isDeleting[row.realId];
  }

  public deleteRecord(record) {
    this.res.deleteRecord(record);
  }

  public setCurrentRecord(record) { 
    this.dataService.setCurrentRecord(record);// set current record for consumption by another component i.e. Financials
    this.currentRecord = record; // For Family Contact modal
  }

  toggleChildTable(row) {
    this.showChildren[row.realId] = !this.showChildren[row.realId];
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  // Family Record Modal
  openModal(id: string) {
    // this.currentRecord = record;
    this.modalService.open(id);
    if(id === 'record-entry-modal'){
      this.res.isUpdating$.next(false);
    }
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
