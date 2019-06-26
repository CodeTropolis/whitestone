import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
// import { RecordInfoComponent } from './record-info/record-info.component';
// import { MomentModule } from 'ngx-moment';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
   // RecordInfoComponent
  ],
  imports: [
    //CommonModule, // Imported in core.module.  
    CoreModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    // MomentModule,
  ],
  //exports:[CoreModule], // Importing/Exporting CoreModule in this module does not work.
  //exports:[CommonModule], // Importing/Exporting CommonModule in this module does not work.
  providers: [],
  bootstrap:
   [AppComponent]
})
export class AppModule { }
