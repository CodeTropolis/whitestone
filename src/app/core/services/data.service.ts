import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class DataService {

 // public currentRecord: any;
 public currentRecord$ = new BehaviorSubject<any>(null);

  constructor() { }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentRecord(record) {
		//console.log('TCL: publicsetCurrentRecord -> record', record)
    this.currentRecord$.next(record)
  }

}