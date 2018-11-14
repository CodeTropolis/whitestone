import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  public currentRecord: any;

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private router: Router) { }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentRecord(record) {
    this.currentRecord = record;
  }

}