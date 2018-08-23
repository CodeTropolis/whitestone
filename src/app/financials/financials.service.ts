import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FinancialsService {

    public currentCategory$ = new BehaviorSubject<string>(null);
    public showAvatarSpinner$ = new BehaviorSubject<boolean>(false); // set to false so that avatar spinner on financials.component does not show initially
    public categories: any;
    
    constructor() { 
       this.categories = {
           tuition: 'Tuition',
           lunch : 'Lunch',
           extendedCare: 'Extended Care', 
           misc: 'Misc',
       }
    }

}