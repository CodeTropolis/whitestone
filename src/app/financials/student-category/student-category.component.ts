import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';
import { BehaviorSubject } from 'rxjs';
import { ModalService } from '../../modal/modal.service';
import { RecordFormService } from '../../core/services/record-form.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-student-category',
  templateUrl: './student-category.component.html',
  styleUrls: ['./student-category.component.css']
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
  public currentCategory: string;

  private subscriptions: any[] = [];

  constructor(
    private dataService: DataService,
    private financialsService: FinancialsService,
    private modalService: ModalService,
    private recordFormService: RecordFormService,
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

    this.subscriptions.push(
      this.dataService.currentRecord$.subscribe(record => {
        if (record){
          this.currentRecord = record;
          this.studentsOfRecord = this.dataService.convertMapToArray(record.children);
          if (this.studentsOfRecord.length === 1) {
            this.setFinancialDoc(this.studentsOfRecord[0]);
          }
        } else {
          console.log('There is an issue obtaining the current record');
        }
      })
    )

    // Listen for the currentFinancialDoc.
    this.subscriptions.push(
      this.financialsService.currentFinancialDoc$.subscribe(doc => {
        if (doc) {
          this.currentFinancialDoc = doc;
          this.enableCatButtons = true;
        } else {
          this.enableCatButtons = false;
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
    this.currentStudent = student;
    this.financialsService.setFinancialDoc(student);
    // Set currentCategory$ to null to prevent previously selected student's category entry form from showing
    this.financialsService.currentCategory$.next(null);
    // Do not show history from previously selected student after clicking on another student
    this.financialsService.showHistory$.next(false);

  }

  public setCategory(cat) {
    this.financialsService.currentCategory$.next(cat);

    this.currentCategory = cat.val;
    console.log(`MD: StudentCategoryComponent -> setCategory -> this.currentCategory`, this.currentCategory);

    // this.financialsService.currentCategory$.subscribe(cat => {
    //   if (cat) {
    //     this.currentCategory = cat.val;
    //     if (this.currentCategory === 'Tuition') { alert('tuition') }
    //     console.log(`MD: StudentCategoryComponent -> ngOnInit -> this.currentCategory`, this.currentCategory);
    //   }
    // });

    setTimeout(_ => {
      window.scrollBy(0, 500);
    }, 250);
  }

  public goToURL(url) {
    window.open(url, '_blank');
  }

  public prepFormToUpdate() {
    this.modalService.open('record-entry-modal');
    this.recordFormService.prepFormToUpdate(this.currentRecord);
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

    ngOnDestroy(){
      this.subscriptions.forEach(sub => {
        sub.unsubscribe();
      });
    }

}
