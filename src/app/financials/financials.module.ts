import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../core/core.module';

import { FinancialsRoutingModule } from './financials-routing.module';
import { FinancialsMainComponent } from './financials-main/financials-main.component';
import { FinancialsService } from './financials.service';
import { EntryComponent } from './entry/entry.component';


@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FinancialsRoutingModule,
  ],
  declarations: [
    FinancialsMainComponent, 
    EntryComponent,  
  ],
  providers:[FinancialsService]
})
export class FinancialsModule { }
