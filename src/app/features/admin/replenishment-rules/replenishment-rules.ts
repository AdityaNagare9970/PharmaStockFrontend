import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryControllerService } from '../../../core/services/inventory-controller.service';
import { ReplenishmentRule, PharmLocation, ItemLookup } from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-replenishment-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './replenishment-rules.html',
})
export class ReplenishmentRulesComponent implements OnInit {
  rules      = signal<ReplenishmentRule[]>([]);
  locations  = signal<PharmLocation[]>([]);
  items      = signal<ItemLookup[]>([]);
  isLoading  = signal(true);
  searchTerm = signal('');

  showModal       = signal(false);
  showDeleteModal = signal(false);
  isEditing       = signal(false);
  isSaving        = signal(false);
  isDeleting      = signal(false);

  successMessage = signal('');
  errorMessage   = signal('');

  editingId  = 0;
  deletingId = 0;

  formItemId      = 0;
  formLocationId  = 0;
  formMinLevel    = 0;
  formParLevel    = 100;
  formMaxLevel    = 500;
  formReviewCycle = true;

  filteredRules = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.rules();
    return this.rules().filter(r =>
      (r.itemName || '').toLowerCase().includes(term) ||
      (r.locationName || '').toLowerCase().includes(term)
    );
  });

  constructor(private icService: InventoryControllerService) {}

  ngOnInit() {
    this.icService.getLocations().subscribe({ next: l => this.locations.set(l) });
    this.icService.getItemsLookup().subscribe({ next: i => this.items.set(i) });
    this.loadRules();
  }

  loadRules() {
    this.isLoading.set(true);
    this.icService.getReplenishmentRules().subscribe({
      next: d => { this.rules.set(d); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  openAdd() {
    this.isEditing.set(false);
    this.editingId = 0;
    this.formItemId = 0;
    this.formLocationId = 0;
    this.formMinLevel = 0;
    this.formParLevel = 100;
    this.formMaxLevel = 500;
    this.formReviewCycle = true;
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEdit(rule: ReplenishmentRule) {
    this.isEditing.set(true);
    this.editingId = rule.replenishmentRuleId;
    this.formItemId = rule.itemId;
    this.formLocationId = rule.locationId;
    this.formMinLevel = rule.minLevel;
    this.formParLevel = rule.parLevel;
    this.formMaxLevel = rule.maxLevel;
    this.formReviewCycle = rule.reviewCycle;
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.errorMessage.set('');
  }

  saveRule() {
    this.errorMessage.set('');
    if (this.formMinLevel >= this.formParLevel) {
      this.errorMessage.set('Min level must be less than par level.');
      return;
    }
    if (this.formParLevel >= this.formMaxLevel) {
      this.errorMessage.set('Par level must be less than max level.');
      return;
    }
    const dto = {
      locationId:  this.formLocationId,
      itemId:      this.formItemId,
      minLevel:    this.formMinLevel,
      parLevel:    this.formParLevel,
      maxLevel:    this.formMaxLevel,
      reviewCycle: this.formReviewCycle,
    };
    this.isSaving.set(true);
    const call = this.isEditing()
      ? this.icService.updateReplenishmentRule(this.editingId, dto)
      : this.icService.createReplenishmentRule(dto);

    call.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadRules();
        this.showToast(this.isEditing() ? 'Rule updated.' : 'Rule created.');
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to save rule.');
      },
    });
  }

  confirmDelete(id: number) {
    this.deletingId = id;
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.deletingId = 0;
  }

  deleteRule() {
    this.isDeleting.set(true);
    this.icService.deleteReplenishmentRule(this.deletingId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.loadRules();
        this.showToast('Rule deleted.');
      },
      error: err => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete rule.');
      },
    });
  }

  showToast(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}
