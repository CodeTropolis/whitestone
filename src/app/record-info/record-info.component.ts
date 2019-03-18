import { Component, OnInit } from '@angular/core';
import { DataService } from "../core/services/data.service";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { ModalService } from "../modal/modal.service";

@Component({
  selector: 'app-record-info',
  templateUrl: './record-info.component.html',
  styleUrls: ['./record-info.component.css']
})
export class RecordInfoComponent implements OnInit {
  public currentRecord: any;
  public modalTableDataSource: MatTableDataSource<any>;
  public displayedColumnsModal = [
    "fatherEmail",
    "motherEmail",
    "address",
    "catholic"
  ];

  constructor(private dataService: DataService, private modalService: ModalService) { }

  ngOnInit() {
    this.dataService.currentRecord$.subscribe(currentRecord => {
      this.currentRecord = currentRecord;
    })
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }


}
