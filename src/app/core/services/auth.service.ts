import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, shareReplay } from 'rxjs/operators';

import { firebase } from '@firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../user';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user$: Observable<User>;
  public status$ = new BehaviorSubject<string>(null);
  public error$ = new BehaviorSubject<string>(null);
  public creatingAccount$ = new BehaviorSubject<boolean>(false);

  public user: any;
  public userIsSubcriber$ = new BehaviorSubject<boolean>(null);
  public userIsAdmin$ = new BehaviorSubject<boolean>(null);

  public disableLoginOrCreateButton$ = new BehaviorSubject<boolean>(null);


  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private firebaseService: FirebaseService, private router: Router) {

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


    this.user$.subscribe(user => {
      this.user = user;
      if (user) {
        if (user['roles'].subscriber && !user['roles'].admin) {
          this.userIsSubcriber$.next(true);
          this.userIsAdmin$.next(false)
        }
        if (user['roles'].admin) {
          this.userIsAdmin$.next(true)
        }
      }
    });

  }

  public googleLogin(link: string) {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider, link);
  }

  private oAuthLogin(provider, link: string) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then(() => {
        this.router.navigate([link]);
      })
  }


  public emailLogin(e, p, link) {
    this.disableLoginOrCreateButton$.next(true);
    this.status$.next('');
    const promise = this.afAuth.auth.signInWithEmailAndPassword(e, p);
    promise.then(credential => {
      this.disableLoginOrCreateButton$.next(false);
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
      this.error$.next("Account does not exist. Please create an account.");
    });
  }

  public signUp(e, p) {
    this.disableLoginOrCreateButton$.next(true);
    const promise = this.afAuth.auth.createUserWithEmailAndPassword(e, p);
    promise.then(success => {
    //console.log('TCL: AuthService -> publicsignUp -> success', success);
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
      this.disableLoginOrCreateButton$.next(false);
    })
    promise.catch(err => {
      console.log(err);
      this.error$.next(err);
      this.creatingAccount$.next(false); // Perhaps the user tried to create an account when it already exists so switch back to login or create account UI.  
      this.disableLoginOrCreateButton$.next(false);
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
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`); // ToDo: Lock down users collection.
    const data: User = {
      uid: user.uid,
      email: user.email,
      roles: {
        subscriber: true,
      }
    }
    userRef.set(data, { merge: true })
      .then(_ => {
        this.router.navigate([link]);
      })
  }

}