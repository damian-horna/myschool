import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {StudentService} from "../../service/student/student.service";
import {ClazzService} from "../../service/clazz/clazz.service";
import {HttpClient} from "@angular/common/http";
import {LessonService} from "../../service/lesson/lesson.service";
import {ClassroomService} from "../../service/classroom/classroom.service";
import {SubjectService} from "../../service/subject/subject.service";
import {TeacherService} from "../../service/teacher/teacher.service";
import {LessonAddDialog} from "./dialogs/add/lesson-add.component";
import {NavigationService} from "../../service/navigation/navigation.service";
import {GradeAddDialog} from "../grades/dialogs/add/grade-add.component";

export interface PeriodicElement {
  href: string;
  date: string;
  topic: string;
  classroom: any;
  clazz: any;
  subject: any;
  teacher: any;
  lessonUnit: number;
}

@Component({
  selector: 'app-lesson-list',
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.css']
})
export class LessonListComponent implements OnInit {


  ELEMENT_DATA: PeriodicElement[] = [];
  displayedColumns: string[] = ['topic', 'subject', 'teacher', 'classroom', 'clazz', 'date', 'lessonUnit', 'actions'];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  lessons: any[];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private studentService: StudentService,
              private clazzService: ClazzService,
              private lessonService: LessonService,
              private classroomService: ClassroomService,
              private subjectService: SubjectService,
              private teacherService: TeacherService,
              public dialog: MatDialog,
              private http: HttpClient,
              private navigationService: NavigationService) {
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.lessonService.getAll().subscribe(data => {
      this.lessons = data._embedded.lessons;
      this.ELEMENT_DATA = [];
      for (let i in this.lessons) {
        this.ELEMENT_DATA.push({
          href: this.lessons[i]._links.self.href,
          date: this.lessons[i].date,
          topic: this.lessons[i].topic,
          clazz: '',
          classroom: '',
          subject: '',
          teacher: '',
          lessonUnit: this.lessons[i].lessonUnit
        });
        this.setProps(i)
      }


      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'subject':
            return item.subject.name;
          case 'teacher':
            return item.teacher.name + ' ' + item.teacher.surname;
          case 'classroom':
            return item.classroom.number;
          case 'clazz':
            return item.clazz.name;
          default:
            return item[property];
        }
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  setProps(i) {
    this.http.get(this.lessons[i]._links.clazz.href).subscribe(data => {
      let res: any;
      res = data;
      this.ELEMENT_DATA[i].clazz = res;

    }, err => {

    });
    this.http.get(this.lessons[i]._links.classroom.href).subscribe(data => {
      let res: any;
      res = data;
      this.ELEMENT_DATA[i].classroom = res;
    }, err => {

    });
    this.http.get(this.lessons[i]._links.subject.href).subscribe(data => {
      let res: any;
      res = data;
      this.ELEMENT_DATA[i].subject = res;
    }, err => {

    });
    this.http.get(this.lessons[i]._links.teacher.href).subscribe(data => {
      let res: any;
      res = data;
      this.ELEMENT_DATA[i].teacher = res;
    }, err => {

    });
  }

  delete(href) {
    this.lessonService.remove(href).subscribe(result => {
      this.initialize()
    }, err => {
      alert("Constraint violation exception. Some of the grades should be deleted first.")
    });
  }

  openDialog(href, date, topic, lessonUnit, classroom, clazz, subject, teacher): void {
    console.log(href, date, topic, lessonUnit, classroom, clazz, subject, teacher)
    const dialogRef = this.dialog.open(LessonAddDialog, {
      width: '300px',
      data: {
        href: href,
        topic: topic,
        date: date == '' ? null : new Date(date),
        lessonUnit: lessonUnit.toString(),
        classroom: classroom,
        clazz: clazz,
        subject: subject,
        teacher: teacher
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.initialize()
    });
  }

  showPresentStudents(lesson) {
    this.navigationService.activateScreen(11, lesson);
  }

  showGivenGrades(lesson) {
    this.navigationService.activateScreen(12, lesson);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filterPredicate =
      (data: PeriodicElement, filter: string) => data.date.toLowerCase().includes(filter)
        || data.topic.toLowerCase().includes(filter)
        || (data.teacher.name.toLowerCase() + ' ' + data.teacher.surname.toLowerCase()).includes(filter)
        || data.classroom.number.toString().toLowerCase().includes(filter)
        || data.subject.name.toLowerCase().includes(filter)
        || data.clazz.name.toLowerCase().includes(filter);
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addGrade(lesson) {
    console.log(lesson.href);
    const dialogRef = this.dialog.open(GradeAddDialog, {
      width: '300px',
      data: {
        href: '',
        student: '',
        lesson: lesson.href,
        test: '',
        description: '',
        value: ''
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.initialize()
    });
  }
}
