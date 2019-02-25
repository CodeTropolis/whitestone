import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from '../../core/services/firebase.service';
import { RecordService } from '../record.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/user';
import { ModalService } from '../../modal/modal.service';

//import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFirestore} from '@angular/fire/firestore';
import { Observable, of, combineLatest } from 'rxjs'; // combineLatest works with this import only.
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
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

  public loading: boolean = true;
  public recordMatch: boolean;

  // For modal
  public currentRecord: any;
  public modalTableDataSource: MatTableDataSource<any>;
  public displayedColumnsModal = ['fatherEmail','motherEmail', 'address', 'catholic'];

  private subscriptions: any[] = [];


  //@ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  // Prevent sort from undefined
  // https://stackoverflow.com/a/51084166
  private sort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort){
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
  ) { }

  ngOnInit() {

    this.subscriptions.push(
        this.authService.user$.subscribe(user =>{
        if (user){
          this.user = user; // Custom user object.
          if (user['roles'].admin){
            this.getAllRecords();
            this.recordMatch = true;
          }else{
            this.getMatchingRecords();
          }
        }
      })
    );

    // Get state from service for button state: disable upon edit.
    this.subscriptions.push(this.res.isUpdating$.subscribe(x => this.isUpdating = x));
  }

  private getAllRecords(){
    // this.displayedColumns = ['surname', 'fatherLname', 'motherLname', 'actions'];
    this.displayedColumns = ['fatherLname', 'motherLname', 'actions'];

    this.subscriptions.push(
      this.fs.records$.subscribe(records => {
        if(records){
          this.loading = false;
        }
        this.ds = new MatTableDataSource(records);
  
        // setTimeout(() => {
        //   this.ds.paginator = this.paginator;
        //   this.ds.sort = this.sort;
        // });


        this.ds.filterPredicate = (data, filter) => {
          let dataStr = data.surname + data.fatherFname + data.fatherLname + data.motherFname + data.motherLname;
          const children = this.dataService.convertMapToArray(data.children);
          children.forEach(child => dataStr += (child.fname + child.lname + child.gender + child.grade + child.race));
          dataStr = dataStr.toLowerCase(); // MatTableDataSource defaults to lowercase matches
          return dataStr.indexOf(filter) != -1;
        }

      })
    );
    
  }

  private getMatchingRecords(){

    this.displayedColumns = ['surname', 'actions'];

    const matchFatherEmail = this.afs.collection("records", ref => ref.where("fatherEmail","==", this.user.email));
    const matchMotherEmail = this.afs.collection("records", ref => ref.where("motherEmail","==", this.user.email));
	
    this.records$ = combineLatest(matchFatherEmail.valueChanges(), matchMotherEmail.valueChanges())
      .pipe(switchMap(docs => {
        const [docsFatherEmail, docsMotherEmail] = docs;
        const combined = docsFatherEmail.concat(docsMotherEmail);

        if(combined.length > 0 ){
          this.recordMatch = true;
        }else{
          this.recordMatch = false;
        }
        this.loading = false;
        return of(combined);
      }));

      this.subscriptions.push(this.records$.subscribe(records =>{
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
    this.modalTableDataSource = new MatTableDataSource([record]); // data source must be an arrray.
  }

  toggleChildTable(row) {
    this.showChildren[row.realId] = !this.showChildren[row.realId];
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  // Family Record Modal
  openModal(id: string, record) {
    this.currentRecord = record;
    this.modalService.open(id);
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