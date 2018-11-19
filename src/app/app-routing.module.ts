import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RecordListComponent } from './record/record-list/record-list.component';
//import { RecordResolverService } from './core/services/record-resolver.service';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  //{path: 'record-list', component: RecordListComponent},
  {path: 'record-list', loadChildren: './record/record.module#RecordModule', 
  canLoad:[AuthGuard],
  //resolve: {records: RecordResolverService}
  },
  {path: 'financials', loadChildren: './financials/financials.module#FinancialsModule', 
  canLoad:[AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
 