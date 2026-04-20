import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuditService } from '../../core/services/audit.service';
import { AuditLog } from '../../core/models/audit.model';

@Component({
  selector: 'app-audit',
  imports: [FormsModule],
  templateUrl: './audit.html',
  styleUrl: './audit.css'
})
export class AuditComponent implements OnInit {

  logs = signal<AuditLog[]>([]);

  // ── Filter signals ────────────────────────────────────
  searchQuery      = signal('');
  filterUserId     = signal<number | ''>('');
  filterResource   = signal('');
  filterAction     = signal('');
  filterDateFrom   = signal('');
  filterDateTo     = signal('');

  // ── Derived unique values for dropdowns ──────────────
  uniqueResources = computed(() => {
    const seen = new Set<string>();
    return this.logs()
      .map(l => l.resource)
      .filter(r => r && !seen.has(r) && seen.add(r))
      .sort();
  });

  uniqueActions = computed(() => {
    const seen = new Set<string>();
    return this.logs()
      .map(l => l.action)
      .filter(a => a && !seen.has(a) && seen.add(a))
      .sort();
  });

  // ── Filtered result ───────────────────────────────────
  filteredLogs = computed(() => {
    let result = this.logs();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(l =>
        l.resource.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.userId.toString() === q ||
        l.auditId.toString() === q ||
        (l.metadata ?? '').toLowerCase().includes(q)
      );
    }

    const uid = this.filterUserId();
    if (uid !== '') result = result.filter(l => l.userId === uid);

    const res = this.filterResource();
    if (res) result = result.filter(l => l.resource === res);

    const act = this.filterAction();
    if (act) result = result.filter(l => l.action === act);

    const from = this.filterDateFrom();
    if (from) result = result.filter(l => new Date(l.timestamp) >= new Date(from));

    const to = this.filterDateTo();
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      result = result.filter(l => new Date(l.timestamp) <= toEnd);
    }

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery()    !== '' ||
    this.filterUserId()   !== '' ||
    this.filterResource() !== '' ||
    this.filterAction()   !== '' ||
    this.filterDateFrom() !== '' ||
    this.filterDateTo()   !== ''
  );

  // ── Feedback ──────────────────────────────────────────
  errorMessage = signal('');
  isLoading    = signal(false);

  constructor(private auditService: AuditService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.auditService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next:  (data) => this.logs.set(data),
        error: (err)  => this.errorMessage.set(err.error?.message ?? 'Failed to fetch audit logs.')
      });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterUserId.set('');
    this.filterResource.set('');
    this.filterAction.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
  }

  formatTimestamp(ts: string): string {
    if (!ts) return '—';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString();
  }
}
