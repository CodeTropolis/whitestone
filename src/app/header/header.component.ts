import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() title = 'Header...';
  @Input() showLogOut: boolean = false;
  @Input() link;

  public currentUser$: Observable<any>;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Get the current user from the service and set to async in view
    this.currentUser$ = this.authService.authState;
  }

  public logOut() {
    this.authService.logOut('');
  }

}
