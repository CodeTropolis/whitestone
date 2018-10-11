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

  public user$: Observable<User>;
  public status$ = new BehaviorSubject<string>(null);
  public error$ = new BehaviorSubject<string>(null);
  public creatingAccount$ = new BehaviorSubject<boolean>(false);

  constructor(private afAuth: AngularFireAuth,  private afs: AngularFirestore, private router: Router) { 

    // Subscribe to user$ in a component that may need to 
    // identify the user's role i.e. `user['roles'].subscriber`
    this.user$ = this.afAuth.authState
    .pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
        } else {
          console.log(`User is null`);
          return of(null);
        }
      }),
      shareReplay(1) // Let whatever subscribes get the cached value of the 'users' collection
    );

  }

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
    this.status$.next('');
    const promise = this.afAuth.auth.signInWithEmailAndPassword(e, p);
    promise.then(credential => {
      if (this.afAuth.auth.currentUser.emailVerified) {
        //console.log(`credential: ${JSON.stringify(credential)}`);
        this.updateUserData(credential.user, link); 
        // this.router.navigate([link]);
      } else {
        this.error$.next('Email not verfied. If you have already signed up, please visit your inbox and verify your email.  Once verified, you may return to the app and login.');
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
      this.error$.next('');
      let user: any = this.afAuth.auth.currentUser;
      user.sendEmailVerification().then(_ => {
        this.creatingAccount$.next(false);
        this.status$.next('Thank you. A verification email has been sent to your email address. Once verified, you may return to the app and login.');
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

  private updateUserData(user, link) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      roles: {
        subscriber: true
      }
    }
      userRef.set(data, { merge: true })
      .then(_ => {
        this.router.navigate([link]);
      })
  }
  
}