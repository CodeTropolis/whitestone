import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module'; // Do this for elements needed such as app-header

import { GradesRoutingModule } from './grades-routing.module';
import { BaseComponent } from './base/base.component';
import { StudentListComponent } from './student-list/student-list.component';

@NgModule({
  declarations: [BaseComponent, StudentListComponent],
  imports: [
    CommonModule,
    CoreModule,
    GradesRoutingModule
  ]
})
export class GradesModule { }
