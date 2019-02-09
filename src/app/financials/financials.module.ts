import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { FinancialsRoutingModule } from './financials-routing.module';
import { FinancialsService } from './financials.service';
import { HistoryComponent } from './history/history.component';
import { BaseComponent } from './base/base.component';
import { TaxFormsComponent } from './tax-forms/tax-forms.component';
import { StudentCategoryComponent } from './student-category/student-category.component';
import { EntryComponent } from './entry/entry.component';


@NgModule({
  imports: [
    CoreModule,
    FinancialsRoutingModule,
  ],
  declarations: [HistoryComponent, BaseComponent, TaxFormsComponent, StudentCategoryComponent, EntryComponent],
  providers: [FinancialsService]
})
export class FinancialsModule { }
