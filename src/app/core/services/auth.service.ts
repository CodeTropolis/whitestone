import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, shareReplay } from 'rxjs/operators';

import { firebase } from '@firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth,  private afs: AngularFirestore, private router: Router) { }


  public status$ = new BehaviorSubject<string>(null);
  public error$ = new BehaviorSubject<string>(null);

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
    promise.then(credential => {
      if (this.afAuth.auth.currentUser.emailVerified) {
        //console.log(`credential: ${JSON.stringify(credential)}`);
        this.updateUserData(credential.user);
        this.router.navigate([link]);
      } else {
        this.error$.next('Email not verfied. If you have already signed up, please visit your inbox and verify your email.  You may then return to the app and login.');
      }
    })
    promise.catch(err => {
      console.log(err);
      this.error$.next(err);
    });
  }

  public signUp(e, p) {
    const promise = this.afAuth.auth.createUserWithEmailAndPassword(e, p);
    promise.then(success => {
      let user: any = this.afAuth.auth.currentUser;
      user.sendEmailVerification().then(_ => {
        this.status$.next('Thank you. Please visit your inbox to verify your email address.  You may then return to the app and login.');
      }
      ).catch(
        (err) => {
          console.log(err);
          this.error$.next(err)
        }
      )
    })
    promise.catch(err => {
      console.log(err);
      this.error$.next(err);
    });
  }

  public logOut(link: string) {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate([link]);
    });
  }

  public get authState() {
    return this.afAuth.authState;
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      roles: {
        subscriber: true
      }
    }
      userRef.set(data, { merge: true })
  }
  
}