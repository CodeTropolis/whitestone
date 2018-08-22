import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule }   from '@angular/forms';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { MapToIterablePipe } from './pipes/map-to-iterable.pipe';
import { environment } from '../../environments/environment';

@NgModule({
  imports: [
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase),// imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    MaterialModule,
    ReactiveFormsModule,
  ],
  providers: [],
  declarations: [
    ProgressSpinnerComponent, 
    MapToIterablePipe,
  ],
  exports:[
    CommonModule,
    ProgressSpinnerComponent,   
    MapToIterablePipe,
    MaterialModule,
    ReactiveFormsModule,
  ],
})
export class CoreModule { }
