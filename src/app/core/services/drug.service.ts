import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Drug, CreateDrug, UpdateDrug } from '../models/drug.model';

@Injectable({ providedIn: 'root' })
export class DrugService {
  private apiUrl = 'http://localhost:5259/api/v1/drugs';

  constructor(private http: HttpClient) {}

  // Normalizes both PascalCase (backend default) and camelCase responses
  private normalize(raw: any): Drug {
    return {
      drugId:       raw.drugId       ?? raw.DrugId       ?? 0,
      genericName:  raw.genericName  ?? raw.GenericName  ?? '',
      brandName:    raw.brandName    ?? raw.BrandName    ?? '',
      strength:     raw.strength     ?? raw.Strength     ?? '',
      form:         raw.form         ?? raw.Form         ?? 0,
      atccode:      raw.atccode      ?? raw.Atccode      ?? '',
      controlClass: raw.controlClass ?? raw.ControlClass ?? 0,
      storageClass: raw.storageClass ?? raw.StorageClass ?? 0,
      status:       raw.status       ?? raw.Status       ?? false,
    };
  }

  getAll(filter?: { page?: number; pageSize?: number; genericName?: string; storageClass?: number; controlClass?: number; status?: boolean }) {
    let params = `PageSize=${filter?.pageSize ?? 1000}`;
    if (filter?.page)         params += `&Page=${filter.page}`;
    if (filter?.genericName)  params += `&GenericName=${encodeURIComponent(filter.genericName)}`;
    if (filter?.storageClass !== undefined) params += `&StorageClass=${filter.storageClass}`;
    if (filter?.controlClass !== undefined) params += `&ControlClass=${filter.controlClass}`;
    if (filter?.status       !== undefined) params += `&Status=${filter.status}`;
    return this.http.get<any>(`${this.apiUrl}?${params}`).pipe(
      map(result => {
        const items: any[] = result.items ?? result.Items ?? result ?? [];
        return items.map(raw => this.normalize(raw));
      })
    );
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(raw => this.normalize(raw))
    );
  }

  create(data: CreateDrug) {
    return this.http.post<Drug>(`${this.apiUrl}/CreateDrug`, data);
  }

  update(drugId: number, data: UpdateDrug) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/UpdateDrug/${drugId}`, data);
  }

  delete(drugId: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/DeleteDrug/${drugId}`);
  }
}
