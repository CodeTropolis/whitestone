import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css']
})
export class BaseComponent implements OnInit {

  public currentRecord: any;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.currentRecord = this.dataService.currentRecord; // Remember, currentRecord is set by clicking one of the buttons, 'Financials' or 'Grades', etc in the record-list.component row.""
  }

}
