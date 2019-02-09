import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { FinancialsRoutingModule } from './financials-routing.module';
import { FinancialsService } from './financials.service';
import { EntryCategoryComponent } from './entry-category/entry-category.component';
import { HistoryComponent } from './history/history.component';
import { BaseComponent } from './base/base.component';
import { TaxFormsComponent } from './tax-forms/tax-forms.component';
import { StudentCategoryComponent } from './student-category/student-category.component';


@NgModule({
  imports: [
    CoreModule,
    FinancialsRoutingModule,
  ],
  declarations: [EntryCategoryComponent, HistoryComponent, BaseComponent, TaxFormsComponent, StudentCategoryComponent],
  providers: [FinancialsService]
})
export class FinancialsModule { }
