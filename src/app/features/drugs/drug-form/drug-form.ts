import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { DrugService } from '../../../core/services/drug.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';

@Component({
  selector: 'app-drug-form',
  standalone: true,
  imports: [SidebarComponent, ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex h-screen bg-gray-100">
      <app-sidebar />

      <div class="flex-1 ml-64 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <header class="bg-white shadow-sm px-6 py-4 flex items-center justify-between shrink-0">
          <h1 class="text-xl font-semibold text-gray-800">
            {{ isEditMode() ? 'Edit Drug' : 'Add Drug' }}
          </h1>
          <button
            (click)="logout()"
            class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </header>

        <!-- Content -->
        <main class="flex-1 p-6 overflow-auto">
          @if (loadingDrug()) {
            <div class="flex items-center justify-center py-20">
              <div
                class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          } @else {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-base font-semibold text-gray-800">
                  {{ isEditMode() ? 'Edit Drug Details' : 'New Drug' }}
                </h2>
              </div>

              <form [formGroup]="drugForm" (ngSubmit)="onSubmit()" class="px-6 py-6 space-y-5">
                @if (serverError()) {
                  <div
                    class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {{ serverError() }}
                  </div>
                }

                <!-- Row 1: Generic Name + Brand Name -->
                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      formControlName="genericName"
                      type="text"
                      placeholder="e.g. Paracetamol"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-400]="isInvalid('genericName')"
                      [class.border-gray-300]="!isInvalid('genericName')"
                    />
                    @if (isInvalid('genericName')) {
                      <p class="text-red-500 text-xs mt-1">Generic name is required</p>
                    }
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      formControlName="brandName"
                      type="text"
                      placeholder="e.g. Tylenol"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-400]="isInvalid('brandName')"
                      [class.border-gray-300]="!isInvalid('brandName')"
                    />
                    @if (isInvalid('brandName')) {
                      <p class="text-red-500 text-xs mt-1">Brand name is required</p>
                    }
                  </div>
                </div>

                <!-- Row 2: Strength + ATC Code -->
                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                    <input
                      formControlName="strength"
                      type="text"
                      placeholder="e.g. 500mg"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ATC Code</label>
                    <input
                      formControlName="atccode"
                      type="text"
                      placeholder="e.g. N02BE01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <!-- Row 3: Form ID + Storage Class + Control Class -->
                <div class="grid grid-cols-3 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Form (ID)</label>
                    <input
                      formControlName="form"
                      type="number"
                      min="1"
                      placeholder="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Storage Class (ID)
                    </label>
                    <input
                      formControlName="storageClass"
                      type="number"
                      min="1"
                      placeholder="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Control Class (ID)
                    </label>
                    <input
                      formControlName="controlClass"
                      type="number"
                      min="1"
                      placeholder="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <!-- Row 4: Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    formControlName="status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    [disabled]="submitting()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    @if (submitting()) {
                      <span class="flex items-center gap-2">
                        <span
                          class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
                        ></span>
                        Saving...
                      </span>
                    } @else {
                      {{ isEditMode() ? 'Update Drug' : 'Add Drug' }}
                    }
                  </button>
                  <a
                    routerLink="/drugs"
                    class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </a>
                </div>
              </form>
            </div>
          }
        </main>
      </div>
    </div>
  `,
})
export class DrugFormComponent implements OnInit {
  drugForm: FormGroup;
  isEditMode = signal(false);
  loadingDrug = signal(false);
  submitting = signal(false);
  serverError = signal('');
  drugId = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private drugService: DrugService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.drugForm = this.fb.group({
      genericName: ['', Validators.required],
      brandName: ['', Validators.required],
      strength: [''],
      atccode: [''],
      form: [null],
      storageClass: [null],
      controlClass: [null],
      status: ['true'],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.drugId.set(+id);
      this.loadDrug(+id);
    }
  }

  loadDrug(id: number) {
    this.loadingDrug.set(true);
    this.drugService.getById(id).subscribe({
      next: (drug) => {
        this.drugForm.patchValue({
          ...drug,
          status: drug.status ? 'true' : 'false',
        });
        this.loadingDrug.set(false);
      },
      error: () => {
        this.router.navigate(['/drugs']);
      },
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.drugForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit() {
    this.drugForm.markAllAsTouched();
    if (this.drugForm.invalid) return;

    this.submitting.set(true);
    this.serverError.set('');

    const raw = this.drugForm.value;
    const dto = {
      ...raw,
      status: raw.status === 'true',
      form: raw.form ? Number(raw.form) : null,
      storageClass: raw.storageClass ? Number(raw.storageClass) : null,
      controlClass: raw.controlClass ? Number(raw.controlClass) : null,
    };

    const req: Observable<unknown> = this.isEditMode()
      ? this.drugService.update(this.drugId()!, dto)
      : this.drugService.create(dto);

    req.subscribe({
      next: () => this.router.navigate(['/drugs']),
      error: (err: any) => {
        this.serverError.set(err.error?.message || 'Operation failed. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
