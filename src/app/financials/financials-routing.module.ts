import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { StudentSelectComponent } from './student-select/student-select.component'
import { BaseComponent } from './base/base.component';

const routes: Routes = [
  // {path: '',component: StudentSelectComponent},
  {path: '',component: BaseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialsRoutingModule { }
