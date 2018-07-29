import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FinancialsService {

    public currentCategory$ = new BehaviorSubject<string>(null);
    //public currentFinancialDoc: any;
    public categories: any;
    
    constructor() { 
       this.categories = {
           tuition: 'Tuition',
           lunch : 'Lunch',
           extraCare: 'Extra Care', 
           misc: 'Misc',
       }
    }

}