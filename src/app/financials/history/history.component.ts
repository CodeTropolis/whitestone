import { Component, OnInit, ViewChild } from "@angular/core";
import { FinancialsService } from "../financials.service";
import { BehaviorSubject } from "rxjs";
import { MatSort, MatTableDataSource } from "@angular/material";
import { AuthService } from "../../core/services/auth.service";
//import { delay } from "rxjs/operators";

@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.css"]
})
export class HistoryComponent implements OnInit {
  private subscriptions: any[] = [];

  public currentFinancialDoc: any;
  public currentCategory: string;
  public currentChild: string;
  public runningBalanceKey: string;
  public transactions$: BehaviorSubject<any[]>;
  public tableData: MatTableDataSource<any>;
  public tableColumns;
  @ViewChild(MatSort) sort: MatSort;
  public disableDelete: boolean[] = [];
  public user: any;

  private runningBalance: number;
  private updatedBalance: number;
  private chargesCollection: string;
  private paymentsCollection: string;

  constructor(
    private financialsService: FinancialsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.authService.user$
        //.pipe(delay(2000))
        .subscribe(user => {
          if (user) {
            this.user = user; // For conditionals in view i.e. *ngIf="user['roles].admin"
            if (this.user["roles"].admin) {
              this.tableColumns = ["amount", "type", "date", "memo", "delete"];
            } else {
              this.tableColumns = ["amount", "type", "date", "memo"];
            }
          }
        })
    );

    // currentFinancialDoc$ next'd by student-category.component
    this.subscriptions.push(
      this.financialsService.currentFinancialDoc$.subscribe(doc => {
        if (doc) {
          this.currentFinancialDoc = doc;
          this.currentChild =
            this.currentFinancialDoc.data().childFirstName +
            " " +
            this.currentFinancialDoc.data().childLastName;
        }
      })
    );

    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        if (cat) {
          this.currentCategory = cat.val;
          this.runningBalanceKey = cat.key + "Balance"; // ensure keys always match other components.  ToDo: Single source of truth.
          this.chargesCollection = cat.key + "Charges";
          this.paymentsCollection = cat.key + "Payments";

          if (
            this.currentFinancialDoc &&
            this.chargesCollection &&
            this.paymentsCollection
          ) {
            this.setupHistory();
          } else {
            console.log(
              "Issue with setting currentFinancialDoc, and/or payments/charges collection strings"
            );
          }
        }
      })
    );

    // Get the running balance which is next'd by entry.component.
    //  Trying to get it via this.currentFinancialDoc.data()[this.runningBalanceKey] sometimes returns as undefined
    this.financialsService.runningBalanceForCurrentCategory$.subscribe(
      runningBalance => {
        //console.log(runningBalance);
        this.runningBalance = runningBalance;
      }
    );
  } // end init()

  private setupHistory() {
    this.subscriptions.push(
      // Moving the subscription here may have fixed history sorting.
      // Unsure at this point because sorting issue seemed intermittent.
      this.financialsService.transactions$
        // .pipe(delay(2000))
        .subscribe(data => {
          // if(data) prevents 'Cannot read property 'slice' of null' error upon clicking 'View History'.
          // Reason: data property in subscription null for a moment until populated
          if (data) {
            this.tableData = new MatTableDataSource(data);
            this.tableData.sort = this.sort;
            //this.loading = false;
          }
        })
    );

    this.financialsService.transactions = []; //  to prevent dup entries.
    this.financialsService.transactions$.next(null);
    this.financialsService.getTransactions(
      this.currentFinancialDoc,
      this.paymentsCollection
    );
    this.financialsService.getTransactions(
      this.currentFinancialDoc,
      this.chargesCollection
    );
  }

  public deleteTransaction(id: string, type: string, amount: number) {
    this.disableDelete[id] = true; // Prevent user from entering delete multiple times for a row.

    type === "Payment"
      ? (this.updatedBalance = this.runningBalance + amount)
      : (this.updatedBalance = this.runningBalance - amount);

    // Update the running balance in the DB
    this.currentFinancialDoc.ref
      .set({ [this.runningBalanceKey]: this.updatedBalance }, { merge: true })
      .then(_ => {
        this.financialsService.runningBalanceForCurrentCategory$.next(
          this.updatedBalance
        ); // For entry.component to show Running Balance

        // Delete the sub-collection that is the payment or charge being deleted.
        let collection: string;
        // Determine sub-collection.
        type === "Payment"
          ? (collection = this.paymentsCollection)
          : (collection = this.chargesCollection);
        this.currentFinancialDoc.ref
          .collection(collection)
          .doc(id)
          .delete()
          .then(_ => {
            // Update history table data.
            this.setupHistory();
          });
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
