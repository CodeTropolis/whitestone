import { Component, OnInit } from "@angular/core";
import { DataService } from "../../core/services/data.service";
import { FinancialsService } from "../financials.service";
import { BehaviorSubject } from "rxjs";
import { ModalService } from "../../modal/modal.service";
import { RecordService } from "../../core/services/record.service";
import { FirebaseService } from "../../core/services/firebase.service";
import { AuthService } from "../../core/services/auth.service";


@Component({
  selector: "app-student-category",
  templateUrl: "./student-category.component.html",
  styleUrls: ["./student-category.component.css"]
})
export class StudentCategoryComponent implements OnInit {
  public currentRecord: any;
  public currentRecordId: string;
  public currentFinancialDoc: any;
  public studentsOfRecord: any[] = [];
  public currentStudent: any;
  public categories: any[] = [];
  public currentStudent$: BehaviorSubject<any>;
  public enableCatButtons: boolean;
  public user: any;
  //public viewHasInit: boolean;

  private subscriptions: any[] = [];

  constructor(
    private dataService: DataService,
    private financialsService: FinancialsService,
    private modalService: ModalService,
    private recordService: RecordService,
    private firebaseService: FirebaseService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Set current financial doc to null else category buttons will be active prior to selecting student.
    this.financialsService.currentFinancialDoc$.next(null);
    // Set current category to null else entry.component will
    // detect a category and run through checks for balance and transactions.
    this.financialsService.currentCategory$.next(null);

    this.enableCatButtons = false;

    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
          this.user = user; // Custom user object.
      })
    );

    // Listen for the currentFinancialDoc.
    this.subscriptions.push(
      this.financialsService.currentFinancialDoc$.subscribe(doc => {
        if (doc) {
          this.currentFinancialDoc = doc;
          this.enableCatButtons = true;
        } else {
          this.enableCatButtons = false;
          //console.log('financial doc null')
        }
      })
    );

    this.categories = this.financialsService.categories;
    // Set currentStudent to null so that we don't have a student set from previous use of this component.
    this.financialsService.currentStudent$.next(null);
    // Listen for currentStudent selection
    this.currentStudent$ = this.financialsService.currentStudent$;
    // showHistory may still be set to true when entering back into this component.
    //  Set to false to avoid null history.
    this.financialsService.showHistory$.next(false);
  }

  ngAfterViewInit(){ 
    // Placed the following in afterViewInit to prevent setFinancialDoc from triggering upon click of 'more menu' on 
    // record-list.component when there is only one child.
    // Although this issue doesn't causing any breaking, it may cause an 
    // additional write (write counts on merge when nothing actually changes?).

    // https://blog.angular-university.io/angular-debugging/
    setTimeout(() =>{
      this.subscriptions.push(
        this.dataService.currentRecord$.subscribe(record =>{
          if (record){
            //console.log('TCL: StudentCategoryComponent -> ngOnInit -> record', record)
            this.currentRecord = record;
            this.studentsOfRecord = this.dataService.convertMapToArray(record.children);
            if(this.studentsOfRecord.length === 1){
              this.setFinancialDoc(this.studentsOfRecord[0])
            }
          }else{
            console.log("There is an issue obtaining the current record");
          }
        })
      )
    })
  }

  public setFinancialDoc(student) {
    this.currentStudent = student;
    this.financialsService.setFinancialDoc(student);
    // Set currentCategory$ to null to prevent previously selected student's category entry form from showing
    this.financialsService.currentCategory$.next(null);
    // Do not show history from previously selected student after clicking on another student
    this.financialsService.showHistory$.next(false); 
  }

  public setCategory(cat) {
    this.financialsService.currentCategory$.next(cat);

    setTimeout(_ => {
      window.scrollBy(0, 500);
    }, 250);
  }

  public goToURL(url) {
    window.open(url, "_blank");
  }

  public prepFormToUpdate() {
    this.modalService.open('record-entry-modal');
    setTimeout(() => this.recordService.prepFormToUpdate(this.currentRecord), 250); // Give form a chance to load prior to populating
  }

  openModal(id: string) {
    this.modalService.open(id);
  }


}
