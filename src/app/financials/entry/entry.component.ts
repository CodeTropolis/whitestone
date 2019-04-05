import { Component, OnInit } from "@angular/core";
import { FinancialsService } from "../financials.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-entry",
  templateUrl: "./entry.component.html",
  styleUrls: ["./entry.component.css"]
})
export class EntryComponent implements OnInit {
  public currentCategory: any;
  public currentFinancialDoc: any;

  public tuitionMonthlyPaymentKey: string;
  public tuitionRequiredMonthlyPayment: number;

  public startingBalanceKey: string;
  public startingBalanceDateKey: string;
  public startingBalanceMemoKey: string;
  public runningBalanceKey: string;

  public startingBalance: number;
  public runningBalance: number;

  public balanceIsNegative: boolean;

  public formGroup: FormGroup;
  public formValue: any;
  public formReady: boolean;

  public disableSubmitButton: boolean;

  public user: any;

  public isEnteringPayment: boolean = false;
  public isEnteringCharge: boolean = false;

  public paymentsCollectionExists: boolean;
  public chargesCollectionExists: boolean;

  public showHistory: boolean;

  private chargesCollection: string;
  private paymentsCollection: string;

  private subscriptions: any[] = [];

  public showStartingBalanceInput: boolean;

  constructor(
    private financialsService: FinancialsService,
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
        //console.log('TCL: EntryComponent -> ngOnInit -> user', user)
        if (user) {
          this.user = user; // For conditionals in view i.e. *ngIf="user['roles].admin"
        }
      })
    );

    // subscribe to get the current value of showHistory$ as another component i.e. tax-forms, may have changed it.
    // Otherwise, when tax-form hides history, 'View History' ( which triggers toggleHistory method) button would need to be clicked twice in order for history to show.

    this.subscriptions.push(
      this.financialsService.showHistory$.subscribe(x => {
        this.showHistory = x;
      })
    );

    this.tuitionMonthlyPaymentKey = "tuitionRequiredMonthlyPayment";

    // Listen for current financial doc set in student-category.component
    this.subscriptions.push(
      this.financialsService.currentFinancialDoc$.subscribe(doc => {
        if (doc) {
          this.currentFinancialDoc = doc;
        } else {
          //console.log('No financial data for this student.');
        }
      })
    );

    // Listen for category selection (from student-category.component)
    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        this.isEnteringCharge = false;
        this.isEnteringPayment = false;
        this.currentCategory = cat; // Allow currentCategory to be set to null (null passed from select student).
        if (cat) {
          this.startingBalanceKey = cat.key + "StartingBalance";
          this.startingBalanceDateKey = cat.key + "StartingBalanceDate";
          this.startingBalanceMemoKey = cat.key + "StartingBalanceMemo";
          this.runningBalanceKey = cat.key + "Balance"; // Do not change key strings.  Keys already present in DB.
          this.chargesCollection = cat.key + "Charges";
          this.paymentsCollection = cat.key + "Payments";
          this.checkForBalance();
          //  checkForTransactions - do this here as subcollecton may exist upon selecting cat and
          //  do this after processing a transaction as the subcollecton will exist after a transaction
          this.checkForTransactions();
          this.getTuitionMonthlyPaymentAmount();
          this.showHistory = false;
          this.financialsService.showHistory$.next(this.showHistory); // Do not show history from previously selected category after clicking on another category
        }
      })
    );

    // Listen for balance update.  An update could come from the history.component.
    this.financialsService.runningBalanceForCurrentCategory$.subscribe(bal => {
      this.runningBalance = bal;
      if (Math.sign(this.runningBalance) === -1) {
        this.balanceIsNegative = true;
      } else {
        this.balanceIsNegative = false;
      }
    });

    this.isEnteringCharge = false;
    this.isEnteringPayment = false;

    this.setFormControls();
    this.formReady = false;
  }

  private checkForBalance() {
    this.currentFinancialDoc.ref.get().then(snapshot => {
      if (
        snapshot.data()[this.startingBalanceKey] ||
        snapshot.data()[this.startingBalanceKey] === 0
      ) {
        // Important to check for a balance value of zero.
        this.startingBalance = snapshot.data()[this.startingBalanceKey];
        this.runningBalance = snapshot.data()[this.runningBalanceKey];
        this.financialsService.runningBalanceForCurrentCategory$.next(
          snapshot.data()[this.runningBalanceKey]
        );
        this.showStartingBalanceInput = false;
      } else {
        this.startingBalance = null;
        this.showStartingBalanceInput = true;
      }
      this.formReady = true;
    });
  }

  // Determine if tuition monthly payment will show.
  private getTuitionMonthlyPaymentAmount() {
    this.currentFinancialDoc.ref.get().then(snapshot => {
      if (snapshot.data()[this.tuitionMonthlyPaymentKey]) {
        this.tuitionRequiredMonthlyPayment = snapshot.data()[
          this.tuitionMonthlyPaymentKey
        ];
      } else {
        this.tuitionRequiredMonthlyPayment = null;
      }
    });
  }

  // Check if any of the transaction subcollections (payments or charges) exist for the
  // the current financial doc and set booleans.
  private checkForTransactions() {
    // this.charges | payments Collection will be the proper collection based on selected category i.e. tutionCharges.
    // Per https://stackoverflow.com/a/49597381: .collection(..).get() returns a QuerySnapshot which has the property size

    this.currentFinancialDoc.ref
      .collection(this.chargesCollection)
      .get()
      .then(query => {
        if (query.size > 0) {
          this.chargesCollectionExists = true;
        } else {
          this.chargesCollectionExists = false;
        }
      });
    this.currentFinancialDoc.ref
      .collection(this.paymentsCollection)
      .get()
      .then(query => {
        if (query.size > 0) {
          this.paymentsCollectionExists = true;
          // console.log(`${this.paymentsCollection} exists`);
        } else {
          this.paymentsCollectionExists = false;
          // console.log(`${this.paymentsCollection} does not exists`);
        }
      });
  }

  private setFormControls() {
    this.formGroup = this.fb.group({
      tuitionRequiredMonthlyPayment: [""],
      amount: ["", Validators.required],
      date: ["", Validators.required],
      memo: ["", Validators.required]
    });
  }

  public submitHandler(formDirective) {
    this.formValue = this.formGroup.value;
    this.disableSubmitButton = true; // prevent entry from being calc'd multple times as a result of user rapidly pressing enter key multiple times.

    if (this.formValue.tuitionRequiredMonthlyPayment) {
      this.currentFinancialDoc.ref.set(
        {
          [this.tuitionMonthlyPaymentKey]: this.formValue
            .tuitionRequiredMonthlyPayment
        },
        { merge: true }
      );
    }

    if (this.showStartingBalanceInput) {
      this.currentFinancialDoc.ref
        .set(
          {
            [this.startingBalanceKey]: this.formValue.amount,
            [this.runningBalanceKey]: this.formValue.amount,
            [this.startingBalanceDateKey]: this.formValue.date,
            [this.startingBalanceMemoKey]: this.formValue.memo
          },
          { merge: true }
        )
        .then(_ => {
          this.resetForm(formDirective);
          this.checkForBalance();
        });
      // Now that a starting balance has been entered, check for balance in order to set startingBlance so that transactions form elements show.
    } else {
      this.processTransaction(formDirective);
      console.log("process transaction");
    }
    this.getTuitionMonthlyPaymentAmount();
  }

  private processTransaction(formDirective) {
    
    let collection;

    this.isEnteringPayment
      ? (collection = this.currentFinancialDoc.ref.collection(
        this.paymentsCollection
      ))
      : (collection = this.currentFinancialDoc.ref.collection(
        this.chargesCollection
      ));

    collection.doc().set({
      amount: this.formValue.amount,
      date: this.formValue.date,
      memo: this.formValue.memo
    });
    // NOTE: Wrap formula in () and set input to type number or else + will concat.
    this.isEnteringPayment
      ? (this.runningBalance -= this.formValue.amount)
      : (this.runningBalance += this.formValue.amount);
    this.currentFinancialDoc.ref
      .set({ [this.runningBalanceKey]: this.runningBalance }, { merge: true })
      .then(_ => {
        this.financialsService.runningBalanceForCurrentCategory$.next(
          this.runningBalance
        );
        this.resetForm(formDirective);
        this.checkForTransactions();
        this.setupHistory(); // Update history.component
      });
  }

  private setupHistory() {
    this.financialsService.transactions = []; // Prevent duplicate entries
    this.financialsService.transactions$.next(null);
    this.financialsService.getTransactions(
      this.currentFinancialDoc,
      this.chargesCollection
    );
    this.financialsService.getTransactions(
      this.currentFinancialDoc,
      this.paymentsCollection
    );
  }

  public enterPayment() {
    this.isEnteringPayment = true;
    this.isEnteringCharge = false;
    this.resetForm();
  }

  public enterCharge() {
    this.isEnteringPayment = false;
    this.isEnteringCharge = true;
    this.resetForm();
  }

  private resetForm(formDirective?) {
    if (formDirective) {
      formDirective.resetForm(); //See https://stackoverflow.com/a/48217303
    }
    this.formGroup.reset();
    this.disableSubmitButton = false;
  }

  public toggleHistory() {
    this.showHistory = !this.showHistory;
    this.financialsService.showHistory$.next(this.showHistory);

    setTimeout(_ => {
      let el = document.getElementById("history");
      if (el) {
        window.scrollBy(0, 300);
      }
    }, 250);
  }

  public goToURL(url) {
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
