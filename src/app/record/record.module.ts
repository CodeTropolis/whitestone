import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { RecordRoutingModule } from './record-routing.module';
import { RecordEntryComponent } from './record-entry/record-entry.component';
import { RecordListComponent } from './record-list/record-list.component';
import { ChildTableComponent } from './child-table/child-table.component';

import { RecordService } from './record.service';
//import { FinancialsService } from '../core/services/financials.service';

@NgModule({
  imports: [
    CoreModule,
    RecordRoutingModule,
  ],
  declarations: [RecordEntryComponent, RecordListComponent, ChildTableComponent],
  providers: [RecordService]
})
export class RecordModule { }
