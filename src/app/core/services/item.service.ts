import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Item, CreateItem, ItemCreateResponse, ItemActionResponse } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private apiUrl = 'http://localhost:5259/api/items';

  constructor(private http: HttpClient) {}

  private normalize(raw: any): Item {
    return {
      itemId:           raw.itemId           ?? raw.ItemId           ?? 0,
      drugId:           raw.drugId           ?? raw.DrugId           ?? 0,
      packSize:         raw.packSize         ?? raw.PackSize         ?? null,
      uoMId:            raw.uoMId            ?? raw.UoMId            ?? raw.uoM ?? raw.UoM ?? raw.UOM ?? 0,
      conversionToEach: raw.conversionToEach ?? raw.ConversionToEach ?? 0,
      barcode:          raw.barcode          ?? raw.Barcode          ?? '',
    };
  }

  getAll() {
    return this.http.get<any[]>(`${this.apiUrl}/GetAllItems`).pipe(
      map(items => (items ?? []).map(raw => this.normalize(raw)))
    );
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/GetItemById/${id}`).pipe(
      map(raw => this.normalize(raw))
    );
  }

  create(data: CreateItem) {
    return this.http.post<ItemCreateResponse>(`${this.apiUrl}/CreateItem`, data);
  }

  update(itemId: number, data: CreateItem) {
    return this.http.put<ItemActionResponse>(`${this.apiUrl}/UpdateItem/${itemId}`, data);
  }

  delete(itemId: number) {
    return this.http.delete<ItemActionResponse>(`${this.apiUrl}/DeleteItem/${itemId}`);
  }

}
