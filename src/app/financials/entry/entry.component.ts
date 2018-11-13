import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnInit {

  public currentRecord: any;
  public studentsOfRecord: any[] = [];
  public currentStudent: any;

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
   
  }

  public setupFinancialDoc(student){ 
    this.dataService.setupFinancialDoc(student);
    this.currentStudent = student;
  }

}
