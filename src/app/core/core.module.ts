import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { environment } from '../../environments/environment';
import { MatCardModule, MatButtonModule, MatFormFieldModule, MatProgressSpinnerModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { MapToIterablePipe } from './pipes/map-to-iterable.pipe';
import { ReactiveFormsModule }   from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase),// imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [],
  declarations: [
    ProgressSpinnerComponent, 
    MapToIterablePipe,
  ],
  exports:[
    ProgressSpinnerComponent,   
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MapToIterablePipe,
    ReactiveFormsModule,
  ],
})
export class CoreModule { }
