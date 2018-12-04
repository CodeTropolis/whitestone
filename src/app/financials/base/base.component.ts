import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css']
})
export class BaseComponent implements OnInit {

  public currentRecord: any;
  public showHistory$: BehaviorSubject<boolean>;

  constructor(private dataService: DataService,  private financialsService: FinancialsService) { }

  ngOnInit() {
    this.currentRecord = this.dataService.currentRecord;
    this.showHistory$ = this.financialsService.showHistory$;
  }

}
