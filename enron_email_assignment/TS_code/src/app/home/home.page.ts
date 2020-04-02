import { Component } from '@angular/core';
import { BackendApiService } from '../services/backend-api.service';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';

import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private databaseReady: BehaviorSubject<boolean>;
  databaseObj: SQLiteObject;
  readonly database_name: string = "enron_email_datatable.db";
  readonly table_name: string = "enrondata1";
  row_data: any = [];
  public filter_items: any;
  constructor(private api:BackendApiService,
    private platform: Platform,
    private sqlitePorter: SQLitePorter,
    private storage: Storage,
    private http: HttpClient,
    private sqlite: SQLite) {
    // this.api.searchDataFromLocal().subscribe(res => {
    //   console.log(res)
    // }, error => {
    //   console.log(error)
    // })
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {
      this.createDB();
    }).catch(error => {
      console.log(error);
    })

  }

  createDB() {
    this.sqlite.create({
      name: this.database_name,
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        this.databaseObj = db;
        this.storage.get('database_filled').then(val => {
          if (val) {
            this.databaseReady.next(true);
          } else {
            this.fillDatabase();
          }
        });
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
  }

  fillDatabase() {
    this.http.get('assets/data/enron.sql').pipe(
      map((res: any) => res.text()))
      .subscribe(sql => {
        console.log('sdfsdf', sql)
        this.sqlitePorter.importSqlToDb(this.databaseObj, sql)
          .then(data => {
            this.databaseReady.next(true);
            this.storage.set('database_filled', true);
          })
          .catch(e => console.error(e));
      });
  }

  createTable() {
    this.databaseObj.executeSql(`
    CREATE TABLE IF NOT EXISTS ${this.table_name}  (pid INTEGER PRIMARY KEY, dummy_text varchar(255))
    `, [])
      .then(() => {
        console.log('Table Created!');
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
  }

  searchChange (event) {
    const text = (event.detail.value || '').trim().toLowerCase();
    if (text == null || text.length == 0) {
      this.filter_items = null;
    } else {
      this.filter_items = [];
    }
    if (!text) {
      return;
    } else if (text.length < 3) {
      return;
    }
    this.databaseObj.executeSql(`
    SELECT * FROM ${this.table_name} WHERE content LIKE '%${text}%'
    `
      , [])
      .then((res) => {
        this.row_data = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            this.row_data.push(res.rows.item(i));
          }
          this.filter_items = this.row_data
          console.log('res', this.row_data)
        }
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
  }

  ionViewWillEnter() {
    this.filter_items = null;
  }

  ngOnInit() {
  }

  insertRow() {
    for (let i = 0; i < 10; i++) {
      this.databaseObj.executeSql(`
      INSERT INTO ${this.table_name} (dummy_text) VALUES ('${'amir' + i }')
    `, [])
      .then(() => {
        console.log('Row Inserted!');
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
    }
  }

}
