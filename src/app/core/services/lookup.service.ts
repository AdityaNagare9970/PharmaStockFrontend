import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface LookupEntry { id: number; name: string; }
export interface UomEntry { id: number; code: string; description: string; }

@Injectable({ providedIn: 'root' })
export class LookupService {
  private base = 'http://localhost:5259/api/lookup';

  constructor(private http: HttpClient) {}

  getDrugForms() {
    return this.http.get<{ drugFormId: number; form: string }[]>(`${this.base}/drug-forms`).pipe(
      map(items => items.map(i => ({ id: i.drugFormId, name: i.form } as LookupEntry)))
    );
  }

  getControlClasses() {
    return this.http.get<any[]>(`${this.base}/control-classes`).pipe(
      map(items => items.map(i => ({ id: i.controlClassId, name: i['class'] } as LookupEntry)))
    );
  }

  getStorageClasses() {
    return this.http.get<{ binStorageClassId: number; storageClass: string }[]>(`${this.base}/storage-classes`).pipe(
      map(items => items.map(i => ({ id: i.binStorageClassId, name: i.storageClass } as LookupEntry)))
    );
  }

  getDrugStorageClasses() {
    return this.http.get<{ drugStorageClassId: number; class: string }[]>(`${this.base}/drug-storage-classes`).pipe(
      map(items => items.map(i => ({ id: i.drugStorageClassId, name: i['class'] } as LookupEntry)))
    );
  }

  getUoms() {
    return this.http.get<{ uoMid: number; code: string; description: string }[]>(`${this.base}/uoms`).pipe(
      map(items => items.map(i => ({ id: i.uoMid, code: i.code, description: i.description } as UomEntry)))
    );
  }
}
