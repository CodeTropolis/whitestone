import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../core/services/firebase.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public emailLoginForm: FormGroup;
  public loading: Subject<boolean>;

  constructor(private auth: AuthService,  private fb: FormBuilder, private fs:FirebaseService) { }

  ngOnInit() { 
    this.emailLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
    this.loading = this.fs.loading;
  }

  public emailLogin() { 
    const e = this.emailLoginForm.value.email;
    const p = this.emailLoginForm.value.password;
    this.auth.emailLogin(e, p, 'record-list');
  }

  public signUp() {
    const e = this.emailLoginForm.value.email;
    const p = this.emailLoginForm.value.password;
    this.auth.signUp(e, p);
  }

}
