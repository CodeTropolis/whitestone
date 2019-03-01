import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { User } from "../user";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public user$: Observable<User>;
  public status$ = new BehaviorSubject<string>(null);
  public error$ = new BehaviorSubject<string>(null);
  public isResettingPassword$ = new BehaviorSubject<boolean>(null);
  public creatingAccount$ = new BehaviorSubject<boolean>(false);

  public disableLoginOrCreateButton$ = new BehaviorSubject<boolean>(null);

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  public emailLogin(e, p) {
    this.disableLoginOrCreateButton$.next(true);
    this.status$.next("");
    const promise = this.afAuth.auth.signInWithEmailAndPassword(e, p);
    promise.then(credential => {
      this.disableLoginOrCreateButton$.next(false);
      if (this.afAuth.auth.currentUser.emailVerified) {
        this.setUserData(credential.user);
      } else {
        this.error$.next(
          "Email not verified. If you have already signed up, please visit your inbox and verify your email.  Once verified, you may return to the app and login."
        );
      }
    });
    promise.catch(err => {
      console.log(err);
      this.error$.next(err.message);
    });
  }

  public signUp(e, p) {
    this.disableLoginOrCreateButton$.next(true);
    const promise = this.afAuth.auth.createUserWithEmailAndPassword(e, p);
    promise.then(success => {
      this.error$.next("");
      let user: any = this.afAuth.auth.currentUser;
      user.sendEmailVerification()
        .then(_ => {
          this.creatingAccount$.next(false);
          this.status$.next(
            "Thank you. A verification email has been sent to your email address. It is possible that the email was sent to your spam folder. Once verified, you may return to the app and login."
          );
        })
        .catch(err => {
          console.log(err);
          this.error$.next(err);
        });
      this.disableLoginOrCreateButton$.next(false);
    });
    promise.catch(err => {
      console.log(err);
      this.error$.next(err);
      this.creatingAccount$.next(false); // Perhaps the user tried to create an account when it already exists so switch back to login or create account UI.
      this.disableLoginOrCreateButton$.next(false);
    });
  }

  public resetPassword(email: string) {
    return this.afAuth.auth
      .sendPasswordResetEmail(email)
      .then(() => {
        console.log("email sent");
        this.status$.next(
          `Password reset instructions have been sent to ${email}.`
        );
      })
      .catch(error => console.log(error));
  }

  public logOut() {
    this.afAuth.auth.signOut().then(() => {
      // Prevent 'Missing or insufficient permissions...' errors upon logout.
      // See https://medium.com/@dalenguyen/handle-missing-or-insufficient-permissions-firestore-error-on-angular-or-ionic-bf4edb7a7c68
      window.location.reload();
    });
  }

  public get authState() {
    return this.afAuth.authState;
  }

  private setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );

    // Every user should have the same custom data in regards to roles.
    // At this point, users are converted to admin users via Firebase console.

    const data: User = {
      uid: user.uid,
      email: user.email,
      roles: {
        admin: false,
        subscriber: true
      }
    };

    // Only set user data if user doesn't exist.
    userRef.ref.get().then(doc => {
      if (!doc.exists) {
        console.log("Setting user data.");
        userRef.set(data, { merge: true });
      }
    });
  }
}
