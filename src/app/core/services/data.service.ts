import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  public currentRecord: any;

  constructor() { }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentRecord(record) {
    this.currentRecord = record;
  }

}