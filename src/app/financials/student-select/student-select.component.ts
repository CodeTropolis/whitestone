import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-student-select',
  templateUrl: './student-select.component.html',
  styleUrls: ['./student-select.component.css']
})
export class StudentSelectComponent implements OnInit {

  public currentRecord: any;
  public currentFinancialDoc: any;
  public studentsOfRecord: any[] = [];
  public categories: any[] =[];
  public currentStudent$: BehaviorSubject<any>;
  public enableCatButtons: boolean;
  
  private subscriptions: any[] = [];
  
  constructor(private dataService: DataService,  private financialsService: FinancialsService) { }

  ngOnInit() {
    // Set current financial doc to null else category buttons will be 
    //  active prior to selecting student which enables the buttons.
    this.financialsService.currentFinancialDoc$.next(null); 
    // Set current category to null else entry-category.component will 
    //  detect a category and run through checks for balance and tranactions.
    this.financialsService.currentCategory$.next(null);

    this.enableCatButtons = false;
    // currentRecord set by the 'more' menu on available records.
    this.currentRecord = this.dataService.currentRecord;
    if (this.currentRecord){
      // Get all the children of the currentRecord. 
     this.studentsOfRecord = this.dataService.convertMapToArray(this.currentRecord.children)
   }else{
     console.log('There is an issue with obtaining the current record');
   }

   this.subscriptions.push(
    this.financialsService.currentFinancialDoc$.subscribe(doc =>{ 
      if(doc){
        this.currentFinancialDoc = doc;
        this.enableCatButtons = true;
      }else {
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

  public setCurrentStudentAndFinancialDoc(student){ 
    // Existing financial record may not yet have child's first and last name, however,
    //  it will once admin clicks on student.  Until then, get the current student's from 
    //  what is being pased in from student select button.
    this.financialsService.setCurrentStudent(student); 
    this.financialsService.setupFinancialDoc(student);
     // Set currentCategory$ to prevent previously selected student's category entry form from showing
    this.financialsService.currentCategory$.next(null);
    this.financialsService.showHistory$.next(false); // Do not show history from previously selected student after clicking on another student
  }

   public setCategory(cat){
    this.financialsService.currentCategory$.next(cat);
  }

}