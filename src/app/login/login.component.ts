import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../core/services/firebase.service';
import { Subject, Observable } from 'rxjs';

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

  constructor(private auth: AuthService, private fb: FormBuilder, private fs: FirebaseService) {}

  ngOnInit() {

    this.status$ = this.auth.status$;
    this.error$ = this.auth.error$;

    this.auth.creatingAccount$.subscribe(x => {
      this.creatingAccount = x;
    })

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
    
    this.loading = this.fs.loading;
  }

    // convenience getter for easy access to form fields
    get f() {
      return this.form.controls;
    }
  

  public emailLogin() {
    const e = this.form.value.email;
    const p = this.form.value.password;
    this.auth.emailLogin(e, p, 'record-list');
  }

  public signUp() {
    const e = this.form.value.email;
    const p = this.form.value.password;
    this.auth.signUp(e, p);
  }

  public createAccount(formDirective) {
    this.resetForm(formDirective);
   this.auth.creatingAccount$.next(true);
    // Clear out errors may occur if user attempted to login without first creating an account
    this.auth.error$.next('');
    this.auth.status$.next('');
  }

  private resetForm(formDirective) {
    formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    this.form.reset();
  }

}
