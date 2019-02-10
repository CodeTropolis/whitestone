import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DocumentSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnInit {

  public user: any;
  public currentFinancialDoc: DocumentSnapshot<any>;
  public currentCategory: any;

  private subscriptions: any[] = [];

  constructor(private financialsService: FinancialsService, private fb: FormBuilder, private authService: AuthService) { }

    ngOnInit() {

      this.subscriptions.push(
        this.authService.user$.subscribe(user =>{
          if (user){
            this.user = user; // For conditionals in view i.e. *ngIf="user['roles].admin"
          }
        })
      );

      // Listen for current financial doc as a DocumentSnapshot set in student-category.component
      this.subscriptions.push(
        this.financialsService.currentFinancialDoc$.subscribe(doc =>{ 
          if(doc){
					  //console.log('TCL: EntryComponent -> ngOnInit -> doc', doc)
            this.currentFinancialDoc = doc;
          }
        })
      );

      // Listen for category selection (from student-category.component)   
      this.subscriptions.push(
        this.financialsService.currentCategory$.subscribe(cat => {
          // Outside of if(cat){..} to allow currentCategory to be set to null. 
          // this.financialsService.currentCategory$ is next'd to null from 
          // student-category.component upon selecting another student within same record.
          this.currentCategory = cat;  
          if(cat){ }
        })
      );

    }

    ngOnDestroy() {
      this.subscriptions.forEach(sub => {
        sub.unsubscribe();
      });
    }
  
    

}
