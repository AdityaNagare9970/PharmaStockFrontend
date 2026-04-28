import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vendor, VendorRequest } from '../models/vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private base = 'http://localhost:5259/api/vendor';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Vendor[]>(`${this.base}?includeInactive=true`);
  }

  create(vendor: VendorRequest) {
    return this.http.post<Vendor>(`${this.base}/create`, vendor);
  }

  update(id: number, vendor: VendorRequest) {
    return this.http.put<Vendor>(`${this.base}/update/${id}`, { ...vendor, vendorId: id });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
