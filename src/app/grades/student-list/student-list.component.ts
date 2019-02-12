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
  private currentRecord: any;
  private mergedStudents: any[] = [];

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
    this.students$ = this.firebaseService.studentsCollection.valueChanges();
  }

  private writeStudents(){
    // Read all students (children) from records collection
    this.subscriptions.push(
      this.firebaseService.records$.subscribe(docs =>{ 
        this.studentsFromRecord = []; // Prevent duplicates upon record updates / additions.
        docs.forEach(doc =>{
          console.log('writeStudents -> doc.fatherEmail', doc.fatherEmail);
          console.log('writeStudents -> doc.motherEmail', doc.motherEmail);
          this.studentsFromRecord.push(this.dataService.convertMapToArray(doc.children)); // This will yield an array of arrays.
          // I need to add doc.fatherEmail and doc.motherEmail properties to each object
        })
        // Flatten the array of arrays
        this.mergedStudents = [].concat.apply([], this.studentsFromRecord);
        //console.log('this.mergedStudents', this.mergedStudents)
        
        // Write mergedStudents (if doc doesn't exist) to the students collection
        this.mergedStudents.forEach(student =>{
          this.firebaseService.studentsCollection.doc(student.id).ref.get()
          .then(snapshot =>{
            if(!snapshot.exists){
              this.firebaseService.studentsCollection.doc(student.id).set(student);
            }
          });
          // admin may update child info from within record-list
          this.firebaseService.studentsCollection.doc(student.id).update(student); 
        });
      })
    );
  }

  ngOnDestroy(){
    console.log('student-list destroy');
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
