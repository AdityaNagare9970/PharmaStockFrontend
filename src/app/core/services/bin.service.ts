import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Bin, CreateBin, UpdateBin } from '../models/bin.model';

@Injectable({ providedIn: 'root' })
export class BinService {
  private apiUrl = 'http://localhost:5259/api/bins';

  constructor(private http: HttpClient) {}

  private normalize(raw: any): Bin {
    return {
      binId:             raw.binId             ?? raw.BinId             ?? 0,
      locationId:        raw.locationId        ?? raw.LocationId        ?? 0,
      locationName:      raw.locationName      ?? raw.LocationName      ?? '',
      code:              raw.code              ?? raw.Code              ?? '',
      binStorageClassId: raw.binStorageClassId ?? raw.BinStorageClassId ?? 0,
      storageClass:      raw.storageClass      ?? raw.StorageClass      ?? '',
      isQuarantine:      raw.isQuarantine      ?? raw.IsQuarantine      ?? false,
      maxCapacity:       raw.maxCapacity       ?? raw.MaxCapacity       ?? 0,
      isActive:          raw.isActive          ?? raw.IsActive          ?? false,
    };
  }

  getAll() {
    return this.http.get<any>(`${this.apiUrl}/GetAllBins?PageSize=1000`).pipe(
      map(result => {
        const items: any[] = result.items ?? result.Items ?? result ?? [];
        return items.map(raw => this.normalize(raw));
      })
    );
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/GetBinById/${id}`).pipe(
      map(raw => this.normalize(raw))
    );
  }

  create(data: CreateBin) {
    return this.http.post<Bin>(`${this.apiUrl}/CreateBin`, data);
  }

  update(binId: number, data: UpdateBin) {
    return this.http.put<Bin>(`${this.apiUrl}/UpdateBin/${binId}`, data);
  }

  delete(binId: number) {
    return this.http.delete(`${this.apiUrl}/DeleteBin/${binId}`);
  }
}
