import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from '../core/services/firebase.service';
import { AuthService } from '../core/services/auth.service';
import { DataService } from '../core/services/data.service';


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

  // private user: any;

  constructor(private firebaseService: FirebaseService, 
              private authService: AuthService, 
              private dataService: DataService) {

    this.categories = {
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }

  }

  public setupFinancialDoc(student, currentRecord) {

    this.authService.user$.subscribe(user =>{

      if (user){

        this.currentFinancialDoc$.next(null); 

        if (user.roles.admin){ 
          console.log('setupFinancialDoc() User is admin:', user)
          console.log(`grade: ${currentRecord.children[student.id].grade}`),
          // This will either create (.set({...}) )the financial doc or, because of merge: true, this will update the
          // financial doc with the given properties from this.dataService.currentRecord.<property>
          this.firebaseService.financialsCollection.doc(student.id)
          .set({
            recordId: currentRecord.realId,
            // In the beginning, email properties and child's grade level did not exist on the financial doc. 
            // This will ensure that these properties from the currentRecord are copied over and stay in sync.
            fatherEmail: currentRecord.fatherEmail, 
            motherEmail: currentRecord.motherEmail,
            // Create / sync other child info.  Note: grade property added on 3/18/19.
            childFirstName: student.fname,
            childLastName: student.lname,
            grade: currentRecord.children[student.id].grade,
          },  { merge: true })
          .then(_ => { 
            // Now that doc has been written or updated, 
            // get it and pass (next)it to the currentFinancialDoc$ observable.
            this.firebaseService.financialsCollection.doc(student.id).ref.get()
              .then(doc => {
                this.currentFinancialDoc$.next(doc);
              })
          })
    
        }else{ // Non-admin so retrieve only.
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
    });

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
