import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { RecordRoutingModule } from './record-routing.module';
import { RecordListComponent } from './record-list/record-list.component';
import { ChildTableComponent } from './child-table/child-table.component';

@NgModule({
  imports: [
    CoreModule,
    RecordRoutingModule,
  ],
  declarations: [RecordListComponent, ChildTableComponent],
  providers: []
})
export class RecordModule { }
