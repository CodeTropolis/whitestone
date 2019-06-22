import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { ModalService } from '../../modal/modal.service';

@Component({
  selector: 'app-tax-forms',
  templateUrl: './tax-forms.component.html',
  styleUrls: ['./tax-forms.component.css']
})
export class TaxFormsComponent implements OnInit {

  public currentFinancialDoc: any;
  public currentCategory: string;
  public payments: number[]=[];
  public paymentTotal: number;

  public taxYear: any;

  private paymentsCollection: string;
  private subscriptions: any[] = [];

  constructor(private financialsService: FinancialsService, private modalService: ModalService) { }

  ngOnInit() {

    const date = new Date();
    this.taxYear = date.getFullYear() - 1;
    this.subscriptions.push(
      this.financialsService.currentFinancialDoc$.subscribe(doc => {
        if (doc) {
          this.currentFinancialDoc = doc;
        }
      })
    );

    // Get the subcollection name for payments based on the current category.
    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        if (cat) {
          // console.log('TCL: TaxFormsComponent -> ngOnInit -> cat', cat)
          this.currentCategory = cat.val;
          this.paymentsCollection = cat.key + 'Payments';
          // console.log('TCL: TaxFormsComponent -> ngOnInit ->  this.paymentsCollection',  this.paymentsCollection);
        }
      })
    );

    this.subscriptions.push(
      this.financialsService.transactions$.subscribe(transactions => {
        this.payments = [];
        this.paymentTotal = null;
        if (transactions) {
          transactions.forEach(payment => {
            console.log(`MD: TaxFormsComponent -> ngOnInit -> payment.date`, payment.date);
            if (payment.date.getFullYear() === this.taxYear && payment.taxDeductible) {
              this.payments.push(payment);
            }
          });
          this.paymentTotal = 0;
          for (const key in this.payments) {
            // https://stackoverflow.com/a/40789394  Satisfies TS Lint complaint about for in statements must be filtered w/ if.
            if (this.payments.hasOwnProperty(key)) {
              this.paymentTotal += this.payments[key]['amount'];
            }
          }
        }
      })
    );

  }

    openModal(id: string) {

      this.financialsService.showHistory$.next(false);

      this.modalService.open(id);

      this.financialsService.transactions = []; //  wipe out anything that may have been populated by history.component.
      this.financialsService.transactions$.next(null);

      this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);

    }

    closeModal(id: string) {
      this.modalService.close(id);
    }

    print() {
      window.print();
    }

    ngOnDestroy() {
      this.subscriptions.forEach(sub => {
        sub.unsubscribe();
      });
    }
}
