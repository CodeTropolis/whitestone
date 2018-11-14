import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentSelectComponent } from './student-select/student-select.component'

const routes: Routes = [
  {path: '',component: StudentSelectComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialsRoutingModule { }
