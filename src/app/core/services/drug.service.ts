import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Drug,
  CreateDrugDTO,
  UpdateDrugDTO,
  DrugFilterDTO,
  PaginatedResult,
} from '../models/drug.model';

@Injectable({ providedIn: 'root' })
export class DrugService {
  private readonly API_URL = 'http://localhost:5259/api/v1/drugs';

  constructor(private http: HttpClient) {}

  getAll(filter?: DrugFilterDTO): Observable<PaginatedResult<Drug>> {
    let params = new HttpParams();
    if (filter?.page != null)        params = params.set('page', filter.page);
    if (filter?.pageSize != null)    params = params.set('pageSize', filter.pageSize);
    if (filter?.genericName)         params = params.set('genericName', filter.genericName);
    if (filter?.storageClass != null) params = params.set('storageClass', filter.storageClass);
    if (filter?.controlClass != null) params = params.set('controlClass', filter.controlClass);
    if (filter?.status != null)      params = params.set('status', filter.status);
    return this.http.get<PaginatedResult<Drug>>(this.API_URL, { params });
  }

  getById(id: number): Observable<Drug> {
    return this.http.get<Drug>(`${this.API_URL}/${id}`);
  }

  create(dto: CreateDrugDTO): Observable<Drug> {
    return this.http.post<Drug>(`${this.API_URL}/CreateDrug`, dto);
  }

  update(id: number, dto: UpdateDrugDTO): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/UpdateDrug/${id}`, dto);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/DeleteDrug/${id}`);
  }
}
