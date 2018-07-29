import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinancialsMainComponent } from './financials-main/financials-main.component'

const routes: Routes = [
  {path: '',component: FinancialsMainComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialsRoutingModule { }
