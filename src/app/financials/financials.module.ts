import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { FinancialsRoutingModule } from './financials-routing.module';
import { FinancialsService } from './financials.service';
import { StudentSelectComponent } from './student-select/student-select.component';
import { EntryCategoryComponent } from './entry-category/entry-category.component';
import { HistoryComponent } from './history/history.component';
import { BaseComponent } from './base/base.component';


@NgModule({
  imports: [
    CoreModule,
    FinancialsRoutingModule,
  ],
  declarations: [StudentSelectComponent, EntryCategoryComponent, HistoryComponent, BaseComponent],
  providers: [FinancialsService]
})
export class FinancialsModule { }
