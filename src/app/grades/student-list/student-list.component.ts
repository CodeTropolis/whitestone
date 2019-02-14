import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { DataService } from '../../core/services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {

  public user: any;
  public students$: Observable<any>;

  private subscriptions: any[] = [];
  private studentsFromRecord: any[] = [];

  constructor(private authService: AuthService, private firebaseService: FirebaseService, private dataService: DataService) { }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.user$.subscribe(user =>{
        if (user){
          this.user = user; // For conditionals in view i.e. *ngIf="user['roles].admin"
          if(this.user['roles'].admin){
            this.writeStudents();
          }
        }
      })
    );
    this.students$ = this.firebaseService.studentsCollection.valueChanges(); // for view
  }

  private writeStudents(){
    
    this.subscriptions.push(
      // Read all students (children) from records collection
      // Extract the map of children from each record and write to the students collection
      this.firebaseService.records$.subscribe(docs =>{
        docs.forEach(doc =>{
          // Generate an array of children - convert map to array and flatten the resultant array of arrays via .reduce()
          const children = this.dataService.convertMapToArray(doc.children).reduce((acc, arr) => [...acc, ...arr], [])
          children.forEach(child => {
            // Build a new object containing the email address(es) from the current doc iteration (docs.forEach(doc..)) and 
            // the child object from the current child iteration
            this.studentsFromRecord.push({recordId: doc.realId, fatherEmail: doc.fatherEmail, motherEmail: doc.motherEmail, ...child})
          })   
        })

        //console.log('studentsFromRecord: ', this.studentsFromRecord);

        // Write students (if doc doesn't exist) to the students collection
        // ToDo: Need to update student doc if a changes are made to the corresponding record doc.
        this.studentsFromRecord.forEach(student => {
          this.firebaseService.studentsCollection.doc(student.id).ref.get()
          .then(snapshot =>{
            if(!snapshot.exists){
              this.firebaseService.studentsCollection.doc(student.id).set(student);
            }
          });
        });

      })

    );
  }

  ngOnDestroy(){
   // console.log('student-list destroy');
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
