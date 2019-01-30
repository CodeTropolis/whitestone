import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { Observable, BehaviorSubject, pipe } from 'rxjs';
import { ModalService } from '../../modal/modal.service';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-tax-forms',
  templateUrl: './tax-forms.component.html',
  styleUrls: ['./tax-forms.component.css']
})
export class TaxFormsComponent implements OnInit {

  public currentFinancialDoc: any;
  public currentCategory: string;

  private paymentsCollection: string;
  private subscriptions: any[] = [];

  public payments: number[]=[];

  constructor(private financialsService: FinancialsService, private modalService: ModalService, private firebaseService: FirebaseService) { }

  ngOnInit() {

  console.log('TCL: TaxFormsComponent -> ngOnInit -> ngOnInit')
  
    this.subscriptions.push(
      this.financialsService.currentFinancialDoc$.subscribe(doc => {
        if(doc){
          this.currentFinancialDoc = doc;
        }
      })
    );

    // Get the subcollection for payments based on the current category.
    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        if(cat){
          console.log('TCL: TaxFormsComponent -> ngOnInit -> cat', cat)
          this.currentCategory = cat.val;
          this.paymentsCollection = cat.key + 'Payments';
        }
      })
    );

  }

    openModal(id: string) {

			// console.log('TCL: TaxFormsComponent -> openModal -> id', id)
      this.modalService.open(id);

      this.financialsService.transactions = []; //  wipe out anything that may have been populated by history.component.  
      //this.financialsService.transactions$.next(null);
      
      this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);

      this.subscriptions.push(
        this.financialsService.transactions$.subscribe(transactions => { 
          if(transactions){
            this.payments = [];
            transactions.forEach(payment => {
              //console.log(payment.amount);
              this.payments.push(payment);
            });
          }
        })
      );

    }
  
    closeModal(id: string) {
      this.modalService.close(id);
    }

    ngOnDestroy() {
      this.subscriptions.forEach(sub => {
        sub.unsubscribe();
      });
    }
}
