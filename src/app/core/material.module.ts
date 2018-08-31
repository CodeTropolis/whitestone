import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule, MatFormFieldModule, MatProgressSpinnerModule, MatTableModule, MatSortModule, MatPaginatorModule, MatInputModule, MatNativeDateModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  declarations: [],
  exports:[
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
})
export class MaterialModule { }
