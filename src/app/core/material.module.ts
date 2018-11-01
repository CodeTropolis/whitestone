import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule, MatFormFieldModule, MatProgressSpinnerModule, MatTableModule, MatSortModule, MatPaginatorModule, MatInputModule, MatNativeDateModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
//import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu'; // For material menu (3 vertical dots) on Available Records table.
import { MatIconModule } from '@angular/material/icon'; // For material menu (3 vertical dots) on Available Records table.

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
    //MatMomentDateModule,
    MatDatepickerModule,
    MatMenuModule,
    MatIconModule,
  ],
  declarations: [],
  exports: [
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
    //MatMomentDateModule,
    MatDatepickerModule,
    MatMenuModule,
    MatIconModule,
  ],
})
export class MaterialModule { }
