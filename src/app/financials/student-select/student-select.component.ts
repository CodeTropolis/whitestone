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
  public studentsOfRecord: any[] = [];
  public currentStudent$: BehaviorSubject<any>;
  
  constructor(private dataService: DataService,  private financialsService: FinancialsService) { }

  ngOnInit() {
    // currentRecord set by the 'more' menu on available records.
    this.currentRecord = this.dataService.currentRecord;
    if (this.currentRecord){
      // Get all the children of the currentRecord. 
     this.studentsOfRecord = this.dataService.convertMapToArray(this.currentRecord.children)
   }else{
     console.log('There is an issue with obtaining the current record');
   }
    // Set currentStudent to null so that we don't have a student set from previous use of this component.
    this.financialsService.currentStudent$.next(null); 
    // Listen for currentStudent selection 
    this.currentStudent$ = this.financialsService.currentStudent$;

  }

  public setCurrentStudentAndFinancialDoc(student){ 
    this.financialsService.setCurrentStudent(student);
    this.financialsService.setupFinancialDoc(student);
     // Set currentCategory$ to prevent previously selected student's category entry form from showing
    this.financialsService.currentCategory$.next(null);
    this.financialsService.showHistory$.next(false); // Do not show history from previously selected student after clicking on another student
  }

}