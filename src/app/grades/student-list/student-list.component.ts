import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../core/services/firebase.service';
import { DataService } from '../../core/services/data.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {

  private subscriptions: any[] = [];
  private studentsFromRecord: any[] = [];
  private mergedStudents: any[] = [];

  constructor(private firebaseService: FirebaseService, private dataService: DataService) { }

  ngOnInit() {

    // Get listing of *all* students. Allow sorting by grade level.
    // Build from records collection.

    // Read all students (children) from records collection
    this.subscriptions.push(
      this.firebaseService.records$.subscribe(docs =>{ 
        this.studentsFromRecord = []; // Prevent duplicates upon record updates / additions.
        docs.forEach(doc =>{
          this.studentsFromRecord.push(this.dataService.convertMapToArray(doc.children)); // This will yield an array of arrays.
        })
        this.mergedStudents = [].concat.apply([], this.studentsFromRecord);
        console.log('this.mergedStudents', this.mergedStudents)
        
        // Write mergedStudents (if doc doesn't exist) to the students collection
        this.mergedStudents.forEach(student =>{
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
    console.log('student-list destroy');
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
