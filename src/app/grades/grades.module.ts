import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GradesRoutingModule } from './grades-routing.module';
import { BaseComponent } from './base/base.component';

@NgModule({
  declarations: [BaseComponent],
  imports: [
    CommonModule,
    GradesRoutingModule
  ]
})
export class GradesModule { }
