import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class BackendApiService {

  constructor(public http: HttpClient) { }

  searchData(term) {

  }

  searchDataFromLocal() {
    return this.http.get('assets/data/preprocessed.json').pipe(map((response: any) => response.json()))
  }
}
