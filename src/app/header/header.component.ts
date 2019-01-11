import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() color = 'basic'; // Pass in basic or primary.  basic is default.
  @Input() img;
  @Input() title;
  @Input() link;
  @Input() linkName;
  @Input() showUserEmail = false;

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
