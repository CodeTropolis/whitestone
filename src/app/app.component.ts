import { Component } from '@angular/core';
import {
  Router, NavigationStart, NavigationEnd,
  NavigationError, NavigationCancel
} from '@angular/router';
import { FirebaseService } from './core/services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // public loading: boolean = false;

  constructor(private router: Router, private fs: FirebaseService) {
    router.events.subscribe((routerEvent: any) => {
      this.checkRouterEvent(routerEvent);
    })
  }

  private checkRouterEvent(routerEvent: Event) {

    if (routerEvent instanceof NavigationStart) {
      this.fs.loading.next(true);
    }

    if (routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError) {
      this.fs.loading.next(false);
    }

  }

}
