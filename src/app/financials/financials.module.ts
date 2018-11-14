import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { FinancialsRoutingModule } from './financials-routing.module';
import { FinancialsService } from './financials.service';
import { StudentSelectComponent } from './student-select/student-select.component';


@NgModule({
  imports: [
    CoreModule,
    FinancialsRoutingModule,
  ],
  declarations: [StudentSelectComponent],
  providers: [FinancialsService]
})
export class FinancialsModule { }
