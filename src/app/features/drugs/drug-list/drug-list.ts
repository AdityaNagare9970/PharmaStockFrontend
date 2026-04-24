import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DrugService } from '../../../core/services/drug.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { Drug } from '../../../core/models/drug.model';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [SidebarComponent, RouterLink, FormsModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <app-sidebar />

      <div class="flex-1 ml-64 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <header class="bg-white shadow-sm px-6 py-4 flex items-center justify-between shrink-0">
          <h1 class="text-xl font-semibold text-gray-800">Drugs</h1>
          <button (click)="logout()"
            class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors font-medium">
            Logout
          </button>
        </header>

        <!-- Content -->
        <main class="flex-1 p-6 overflow-auto">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">

            <!-- Table header + Add button -->
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-base font-semibold text-gray-800">Drug Inventory</h2>
              <a routerLink="/drugs/add"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium">
                + Add Drug
              </a>
            </div>

            <!-- Filter Bar -->
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div class="flex flex-wrap items-end gap-3">

                <!-- Generic Name search -->
                <div class="flex-1 min-w-48">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Generic Name</label>
                  <input
                    type="text"
                    [(ngModel)]="filterGenericName"
                    placeholder="Search by generic name..."
                    (keyup.enter)="applyFilters()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <!-- Storage Class filter -->
                <div class="w-36">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Storage Class</label>
                  <input
                    type="number"
                    [(ngModel)]="filterStorageClass"
                    placeholder="Any"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <!-- Control Class filter -->
                <div class="w-36">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Control Class</label>
                  <input
                    type="number"
                    [(ngModel)]="filterControlClass"
                    placeholder="Any"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <!-- Search button -->
                <button (click)="applyFilters()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Search
                </button>

                <!-- Clear button — only show when filters are active -->
                @if (hasActiveFilters()) {
                  <button (click)="clearFilters()"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Clear
                  </button>
                }
              </div>

              <!-- Active filter tags -->
              @if (hasActiveFilters()) {
                <div class="flex flex-wrap gap-2 mt-3">
                  @if (filterGenericName) {
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Name: {{ filterGenericName }}
                    </span>
                  }
                  @if (filterStorageClass) {
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Storage Class: {{ filterStorageClass }}
                    </span>
                  }
                  @if (filterControlClass) {
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Control Class: {{ filterControlClass }}
                    </span>
                  }
                </div>
              }
            </div>

            <!-- Loading -->
            @if (loading()) {
              <div class="flex items-center justify-center py-20">
                <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }

            <!-- Error -->
            @else if (error()) {
              <div class="py-16 text-center">
                <p class="text-red-600 text-sm">{{ error() }}</p>
                <button (click)="loadDrugs()" class="mt-3 text-blue-600 hover:underline text-sm">Retry</button>
              </div>
            }

            <!-- Empty -->
            @else if (drugs().length === 0) {
              <div class="py-20 text-center text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <p class="text-base font-medium text-gray-500">No results found</p>
                @if (hasActiveFilters()) {
                  <button (click)="clearFilters()" class="mt-2 text-blue-600 hover:underline text-sm">Clear filters</button>
                }
              </div>
            }

            <!-- Table -->
            @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                      <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Generic Name</th>
                      <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand Name</th>
                      <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Strength</th>
                      <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ATC Code</th>
                      <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (drug of drugs(); track drug.drugId; let i = $index) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 text-gray-400 text-xs">{{ rowNumber(i) }}</td>
                        <td class="px-6 py-4 font-medium text-gray-900">{{ drug.genericName }}</td>
                        <td class="px-6 py-4 text-gray-600">{{ drug.brandName }}</td>
                        <td class="px-6 py-4 text-gray-600">{{ drug.strength }}</td>
                        <td class="px-6 py-4 text-gray-600 font-mono text-xs">{{ drug.atccode }}</td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-2">
                            <a [routerLink]="['/drugs/edit', drug.drugId]"
                              class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors font-medium">
                              Edit
                            </a>
                            <button (click)="confirmDelete(drug)"
                              class="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors font-medium">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination Footer -->
              <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
                <p class="text-sm text-gray-500">
                  Showing
                  <span class="font-medium text-gray-700">{{ rangeStart() }}</span>
                  –
                  <span class="font-medium text-gray-700">{{ rangeEnd() }}</span>
                  of
                  <span class="font-medium text-gray-700">{{ totalCount() }}</span>
                  results
                </p>

                <div class="flex items-center gap-1">
                  <!-- First -->
                  <button (click)="goToPage(1)" [disabled]="currentPage() === 1"
                    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="First page">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <!-- Prev -->
                  <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Previous page">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>

                  <!-- Page numbers -->
                  @for (page of visiblePages(); track page) {
                    @if (page === -1) {
                      <span class="px-1 text-gray-400 text-sm select-none">…</span>
                    } @else {
                      <button (click)="goToPage(page)"
                        [class]="page === currentPage()
                          ? 'w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-semibold'
                          : 'w-8 h-8 rounded-lg text-gray-600 text-sm hover:bg-gray-100 transition-colors'">
                        {{ page }}
                      </button>
                    }
                  }

                  <!-- Next -->
                  <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Next page">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <!-- Last -->
                  <button (click)="goToPage(totalPages())" [disabled]="currentPage() === totalPages()"
                    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Last page">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </main>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Drug</h3>
          <p class="text-gray-600 text-sm mb-6">
            Are you sure you want to delete
            <strong class="text-gray-900">{{ deleteTarget()?.genericName }}</strong>?
            This action cannot be undone.
          </p>
          <div class="flex gap-3 justify-end">
            <button (click)="deleteTarget.set(null)"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium">
              Cancel
            </button>
            <button (click)="deleteDrug()" [disabled]="deleting()"
              class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition-colors font-medium">
              @if (deleting()) { Deleting... } @else { Delete }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DrugListComponent implements OnInit {
  // Table state
  drugs = signal<Drug[]>([]);
  loading = signal(true);
  error = signal('');
  deleteTarget = signal<Drug | null>(null);
  deleting = signal(false);

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);

  // Filter state (bound via ngModel)
  filterGenericName = '';
  filterStorageClass: number | null = null;
  filterControlClass: number | null = null;

  // Computed pagination
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));
  rangeStart = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  rangeEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalCount()));

  hasActiveFilters = computed(() =>
    !!this.filterGenericName ||
    !!this.filterStorageClass || !!this.filterControlClass
  );

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push(-1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  constructor(
    private drugService: DrugService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() { this.loadDrugs(); }

  loadDrugs() {
    this.loading.set(true);
    this.error.set('');

    const filter: any = { page: this.currentPage(), pageSize: this.pageSize() };
    if (this.filterGenericName)   filter.genericName   = this.filterGenericName;
    if (this.filterStorageClass)  filter.storageClass  = this.filterStorageClass;
    if (this.filterControlClass)  filter.controlClass  = this.filterControlClass;

    this.drugService.getAll(filter).subscribe({
      next: (result: any) => {
        this.drugs.set(Array.isArray(result) ? result : (result.items ?? []));
        this.totalCount.set(result.totalCount ?? this.drugs().length);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.message || 'Failed to load drugs. Please try again.');
        this.loading.set(false);
      },
    });
  }

  applyFilters() {
    this.currentPage.set(1); // reset to first page on new search
    this.loadDrugs();
  }

  clearFilters() {
    this.filterGenericName = '';
    this.filterStorageClass = null;
    this.filterControlClass = null;
    this.currentPage.set(1);
    this.loadDrugs();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.loadDrugs();
  }

  rowNumber(index: number): number {
    return (this.currentPage() - 1) * this.pageSize() + index + 1;
  }

  confirmDelete(drug: Drug) { this.deleteTarget.set(drug); }

  deleteDrug() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.drugService.delete(target.drugId).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.deleting.set(false);
        const newTotal = this.totalCount() - 1;
        const maxPage = Math.max(1, Math.ceil(newTotal / this.pageSize()));
        if (this.currentPage() > maxPage) this.currentPage.set(maxPage);
        this.loadDrugs();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to delete drug');
        this.deleting.set(false);
      },
    });
  }

  logout() { this.authService.logout(); }
}
