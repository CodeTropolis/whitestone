import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firebase } from '@firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private router: Router) { }

  public googleLogin(link: string) {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider, link);
  }

  private oAuthLogin(provider, link:string) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then(() => {
        this.router.navigate([link]);
      })
  }

  public emailLogin(e, p, link) {
    const promise = this.afAuth.auth.signInWithEmailAndPassword(e, p);
    promise.then(() => {
      this.router.navigate([link]);
    })
    promise.catch(e => console.log(e));
  }

  public signUp(e, p) {
    const promise = this.afAuth.auth.createUserWithEmailAndPassword(e, p);
    promise.catch(e => console.log(e));
  }


  public logOut(link: string) {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate([link]);
    });
  }

  public get authState() {
    return this.afAuth.authState;
  }
  
}