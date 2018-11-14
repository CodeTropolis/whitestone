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

    this.currentStudent$ = this.financialsService.currentStudent$; // auto subscribe via async.

    // currentRecord set by the 'more' menu on available records.
    this.currentRecord = this.dataService.currentRecord;

    if (this.currentRecord){
       // Get all the children of the currentRecord. 
      this.studentsOfRecord = this.dataService.convertMapToArray(this.currentRecord.children)
    }else{
      console.log('There is an issue with obtaining the current record');
    }
   
  }

  public setCurrentStudentAndFinancialDoc(student){ 
    this.financialsService.setCurrentStudent(student);
    this.financialsService.setupFinancialDoc(student);
  }

}

