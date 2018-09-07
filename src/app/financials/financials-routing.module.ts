import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategorySelectComponent } from './category-select/category-select.component'

const routes: Routes = [
  {path: '',component: CategorySelectComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialsRoutingModule { }
