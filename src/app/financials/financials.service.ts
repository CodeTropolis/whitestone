import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from '../core/services/firebase.service';
import { AuthService } from '../core/services/auth.service';
import { DataService } from '../core/services/data.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FinancialsService {

  public categories: any;
  public currentStudent$ = new BehaviorSubject<any>(null);
  public currentFinancialDoc$ = new BehaviorSubject<any>(null); // Each student has own financial doc
  public currentCategory$ = new BehaviorSubject<any>(null); 
  public runningBalanceForCurrentCategory$ = new BehaviorSubject<number>(null);
  public showHistory$ = new BehaviorSubject<boolean>(null);
  public transactions: any[] = [];
  public transactions$ = new BehaviorSubject<any[]>(null);
  public financialDocs$: Observable<any[]>;

  private user: any;

  constructor(private firebaseService: FirebaseService, 
              private authService: AuthService, 
              private dataService: DataService,
              private afs: AngularFirestore) {

    this.categories = {
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }

    this.authService.user$.subscribe(user =>{
      if (user){
        this.user = user;
      }
    });
  }

  // Pass the father/mother email addresses to the financial document in order to secure reads to match user email.  
  // Outside of if (!snapshot.exists) because, in addition to future financial docs, this also needs to be done for existing financial docs.

  public setupFinancialDoc(student) {

    this.currentFinancialDoc$.next(null); 

    if (this.user['roles'].admin){
      // { merge: true } true prevents destructive overwrite of financial doc.
      // If changes are made to the current doc from the record collection (currentRecord), this will cause
      // the write to update the current financial doc with any changes that are coming from
      // values pulled from this.dataService.currentRecord.<property>
      this.firebaseService.financialsCollection.doc(student.id)
      .set({
        recordId: this.dataService.currentRecord.realId,
        fatherEmail: this.dataService.currentRecord.fatherEmail,
        motherEmail: this.dataService.currentRecord.motherEmail,
        childFirstName: student.fname,
        childLastName: student.lname,
      },  { merge: true })
      .then(_ => { // Set the current financial doc
        this.firebaseService.financialsCollection.doc(student.id).ref.get()
          .then(doc => {
						//console.log('TCL: publicsetupFinancialDoc -> doc.data()', doc.data())
            this.currentFinancialDoc$.next(doc);
          })
      })

    }else{ // Non-admin so retrival only.

      this.firebaseService.financialsCollection.doc(student.id).ref.get() 
        .then(doc => {
          if(doc.data()){
            //console.log('Non-admin ref.get().then(doc) -> doc', doc.data());
              this.currentFinancialDoc$.next(doc); 
          }else{ 
           console.log('No financial data for this student!'); 
          } 
        })
      }
    }

  public getTransactions(currentFinancialDoc, collection){
      // Get transactions (amounts from <cat.key>payments | charges collections)
      const type = collection.includes('Payment') ? 'Payment' : 'Charge';
      currentFinancialDoc.ref.collection(collection).get()
      .then(snapshot => {
          snapshot.forEach(item => {
            let date = item.data().date.toDate();
            const transactionObj = {
              id: item.id, 
              amount: item.data().amount, 
              type: type, 
              date: date,
              memo: item.data().memo 
            }
            this.transactions.push(transactionObj);
            this.transactions$.next(this.transactions);

          });
      });
  }

}
