import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { FinancialsRoutingModule } from './financials-routing.module';
import { CategorySelectComponent } from './category-select/category-select.component';
import { EntryComponent } from './entry/entry.component';
import { HistoryComponent } from './history/history.component';


@NgModule({
  imports: [
    CoreModule,
    FinancialsRoutingModule,
  ],
  declarations: [
    CategorySelectComponent, 
    EntryComponent, HistoryComponent,  
  ]
})
export class FinancialsModule { }
