import { Component, OnInit } from "@angular/core";
import { DataService } from "../../core/services/data.service";
import { FinancialsService } from "../financials.service";
import { BehaviorSubject } from "rxjs";
import { ModalService } from "../../modal/modal.service";
import { RecordService } from "../../core/services/record.service";


@Component({
  selector: "app-student-category",
  templateUrl: "./student-category.component.html",
  styleUrls: ["./student-category.component.css"]
})
export class StudentCategoryComponent implements OnInit {
  public currentRecord: any;
  public currentFinancialDoc: any;
  public studentsOfRecord: any[] = [];
  public categories: any[] = [];
  public currentStudent$: BehaviorSubject<any>;
  public enableCatButtons: boolean;

  private subscriptions: any[] = [];

  constructor(
    private dataService: DataService,
    private financialsService: FinancialsService,
    private modalService: ModalService,
    private recordService: RecordService
  ) {}

  ngOnInit() {
    // Set current financial doc to null else category buttons will be active prior to selecting student.
    this.financialsService.currentFinancialDoc$.next(null);
    // Set current category to null else entry.component will
    // detect a category and run through checks for balance and transactions.
    this.financialsService.currentCategory$.next(null);

    this.enableCatButtons = false;

    // Issue: Upon updating record from this component, update does not reflect on the view of this component because
    // this.currentRecord isn't updated.

    // currentRecord set by the 'more' menu on available records or if non-admin, Financial button
    this.currentRecord = this.dataService.currentRecord;
    if (this.currentRecord) {
      // Get all the children of the currentRecord.
      this.studentsOfRecord = this.dataService.convertMapToArray(this.currentRecord.children);
      if(this.studentsOfRecord.length === 1){
        this.setFinancialDoc(this.studentsOfRecord[0])
      }
    } else {
      console.log("There is an issue obtaining the current record");
    }

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

  public setFinancialDoc(student) {
    this.financialsService.setupFinancialDoc(student);
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
    console.log('TCL: StudentCategoryComponent -> publicprepFormToUpdate -> this.currentRecord', this.currentRecord)
    this.modalService.open('record-entry-modal');
    setTimeout(() => this.recordService.prepFormToUpdate(this.currentRecord), 250); // Give form a chance to load prior to populating
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}
