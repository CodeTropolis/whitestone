import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecordEntryComponent } from './record-entry/record-entry.component'

const routes: Routes = [
  {path: '',component: RecordEntryComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecordRoutingModule { }
