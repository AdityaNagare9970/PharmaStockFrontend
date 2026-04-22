import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Location, CreateLocation, UpdateLocation } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiUrl = 'http://localhost:5259/api/locations';

  constructor(private http: HttpClient) {}

  private normalize(raw: any): Location {
    return {
      locationId:       raw.locationId       ?? raw.LocationId       ?? 0,
      name:             raw.name             ?? raw.Name             ?? '',
      locationTypeId:   raw.locationTypeId   ?? raw.LocationTypeId   ?? 0,
      parentLocationId: raw.parentLocationId ?? raw.ParentLocationId ?? null,
      statusId:         raw.statusId         ?? raw.StatusId         ?? false,
    };
  }

  getAll() {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(items => (items ?? []).map(raw => this.normalize(raw)))
    );
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(raw => this.normalize(raw))
    );
  }

  create(data: CreateLocation) {
    return this.http.post<Location>(this.apiUrl, data);
  }

  update(locationId: number, data: UpdateLocation) {
    return this.http.put(`${this.apiUrl}/${locationId}`, data);
  }

  delete(locationId: number) {
    return this.http.delete(`${this.apiUrl}/${locationId}`);
  }
}
