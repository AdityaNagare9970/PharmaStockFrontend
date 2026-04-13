import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location, CreateLocation, UpdateLocation } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiUrl = 'http://localhost:5259/api/v1/locations';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Location[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateLocation) {
    return this.http.post<Location>(`${this.apiUrl}/CreateLocation`, data);
  }

  update(locationId: number, data: UpdateLocation) {
    return this.http.put(`${this.apiUrl}/UpdateLocation/${locationId}`, data);
  }

  delete(locationId: number) {
    return this.http.delete(`${this.apiUrl}/DeleteLocation/${locationId}`);
  }
}
