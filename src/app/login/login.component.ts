import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../core/services/firebase.service';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public loading: Subject<boolean>;
  public creatingAccount: boolean;

  public status$: Observable<string>;
  public error$: Observable<string>;

  public isResettingPassword$: Observable<boolean>;

  public disableButton: boolean;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private fs: FirebaseService,
    private router: Router
  ) {}

  ngOnInit() {

    // this.auth.user$.subscribe(user => {
    //   if (user) {
    //     this.router.navigate(["record-list"]);
    //   }
    // });
    
    // Navigate only after custom user data write is confirmed else
    // 'missing or insufficient perms...' upon first login.
    this.auth.userDataWritten$.subscribe(x => {
      if(x){
        this.router.navigate(['record-list']);
      }
    })

    this.auth.disableLoginOrCreateButton$.subscribe(x => {
      this.disableButton = x;
    });

    this.status$ = this.auth.status$;
    this.error$ = this.auth.error$;
    this.isResettingPassword$ = this.auth.isResettingPassword$;
    this.auth.isResettingPassword$.next(false);

    this.auth.creatingAccount$.subscribe(x => {
      this.creatingAccount = x;
    });

    this.auth.isResettingPassword$.subscribe(x => {
      if (x) {
        this.form = this.fb.group({
          email: ['', [Validators.required, Validators.email]]
        });
      } else {
        this.form = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', Validators.required]
        });
      }
    });
    this.loading = this.fs.loading;
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  public emailLogin(formDirective) {
    this.auth.error$.next('');
    this.auth.status$.next('');
    const e = this.form.value.email;
    const p = this.form.value.password;
    this.auth.emailLogin(e, p);
    this.resetForm(formDirective);
  }

  public signUp() {
    const e = this.form.value.email;
    const p = this.form.value.password;
    this.auth.signUp(e, p);
  }

  public createAccount(formDirective) {
    this.auth.isResettingPassword$.next(false);
    this.resetForm(formDirective);
    this.auth.creatingAccount$.next(true);
    this.auth.disableLoginOrCreateButton$.next(false);
    // Clear out errors that occur if user attempted to login without first creating an account
    this.auth.error$.next('');
    this.auth.status$.next('');
  }

  public beginPasswordReset(formDirective) {
    // Clear out previously displayed errors or status
    this.auth.error$.next('');
    this.auth.status$.next('');
    this.auth.isResettingPassword$.next(true);
    this.resetForm(formDirective);
  }

  public cancelPasswordReset(formDirective) {
    // Clear out previously displayed errors or status
    this.auth.error$.next('');
    this.auth.status$.next('');
    this.auth.isResettingPassword$.next(false);
    this.resetForm(formDirective);
  }

  public passwordReset(formDirective) {
    this.auth.resetPassword(this.form.value.email);
    this.auth.isResettingPassword$.next(false);
    this.resetForm(formDirective);
  }

  private resetForm(formDirective) {
    formDirective.resetForm(); // See https://stackoverflow.com/a/48217303
    this.form.reset();
  }
}
