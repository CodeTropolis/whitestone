import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RecordResolverService } from './core/services/record-resolver.service';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'record-entry', loadChildren: './record/record.module#RecordModule', 
  canLoad:[AuthGuard],
  resolve: {records: RecordResolverService}
  },
  {path: 'financials', loadChildren: './financials/financials.module#FinancialsModule', 
  canLoad:[AuthGuard],
  //resolve: {records: RecordResolverService}
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
 