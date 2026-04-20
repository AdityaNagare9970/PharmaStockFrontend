import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VendorService } from '../../core/services/vendor.service';
import { Vendor, VendorRequest } from '../../core/models/vendor.model';

@Component({
  selector: 'app-vendor',
  imports: [FormsModule],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
})
export class VendorComponent implements OnInit {
  vendors = signal<Vendor[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  searchName = signal('');

  filteredVendors = computed(() =>
    this.vendors().filter((v) =>
      v.name.toLowerCase().includes(this.searchName().toLowerCase())
    )
  );

  showModal = signal(false);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  isSaving = signal(false);

  showDeleteModal = signal(false);
  deletingId = signal<number | null>(null);
  isDeleting = signal(false);

  // Form fields as individual signals so every field change is tracked reliably
  formName = '';
  formContactInfo = '';
  formEmail = '';
  formPhone = '';
  formRating = 0;
  formStatusId = 'true';   // string for select binding — 'true' | 'false'

  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  private resetForm(): void {
    this.formName = '';
    this.formContactInfo = '';
    this.formEmail = '';
    this.formPhone = '';
    this.formRating = 0;
    this.formStatusId = 'true';
  }

  private buildRequest(): VendorRequest {
    return {
      name: this.formName,
      contactInfo: this.formContactInfo,
      email: this.formEmail,
      phone: this.formPhone,
      rating: Number(this.formRating),
      statusId: this.formStatusId === 'true',
    };
  }

  loadVendors(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.vendorService.getAll().subscribe({
      next: (data) => {
        this.vendors.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Load vendors error:', err);
        this.errorMessage.set(this.extractError(err));
        this.isLoading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.searchName.set('');
  }

  openAdd(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.editingId.set(null);
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEdit(vendor: Vendor): void {
    this.formName        = vendor.name;
    this.formContactInfo = vendor.contactInfo;
    this.formEmail       = vendor.email   ?? '';
    this.formPhone       = vendor.phone   ?? '';
    this.formRating      = vendor.rating  ?? 0;
    this.formStatusId    = vendor.statusId ? 'true' : 'false';
    this.isEditing.set(true);
    this.editingId.set(vendor.vendorId);
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveVendor(): void {
    if (!this.formName.trim() || !this.formContactInfo.trim()) return;

    this.isSaving.set(true);
    const isEdit = this.isEditing();
    const payload = this.buildRequest();

    console.log('>>> Sending payload:', JSON.stringify(payload));

    const action = isEdit
      ? this.vendorService.update(this.editingId()!, payload)
      : this.vendorService.create(payload);

    action.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showModal.set(false);
        this.showSuccess(isEdit ? 'Vendor updated successfully.' : 'Vendor added successfully.');
        this.loadVendors();
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Save vendor error:', err);
        this.errorMessage.set(this.extractError(err));
      },
    });
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.deletingId.set(null);
  }

  deleteVendor(): void {
    this.isDeleting.set(true);
    this.vendorService.delete(this.deletingId()!).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.showSuccess('Vendor deleted successfully.');
        this.loadVendors();
      },
      error: (err) => {
        this.isDeleting.set(false);
        console.error('Delete vendor error:', err);
        this.errorMessage.set(this.extractError(err));
      },
    });
  }

  statusLabel(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  private extractError(err: any): string {
    return (
      err.error?.message ||
      err.error?.title ||
      (typeof err.error === 'string' ? err.error : null) ||
      `Error ${err.status}: ${err.statusText}`
    );
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
