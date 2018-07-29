import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecordRoutingModule } from './record-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RecordEntryComponent } from './record-entry/record-entry.component';
import { RecordListComponent } from './record-list/record-list.component';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { ChildTableComponent } from './child-table/child-table.component';
import { RecordService } from './record.service';

@NgModule({
  imports: [
    CommonModule,
    RecordRoutingModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  declarations: [RecordEntryComponent, RecordListComponent, ChildTableComponent],
  providers: [RecordService]
})
export class RecordModule { }
