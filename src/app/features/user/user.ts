import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole, UpsertUser, UserRoleNames } from '../../core/models/user.model';

type ActiveView = 'list' | 'add' | 'update';

@Component({
  selector: 'app-user',
  imports: [FormsModule],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class UserComponent implements OnInit {

  activeView = signal<ActiveView>('list');

  users       = signal<User[]>([]);
  roles       = signal<UserRole[]>([]);

  // ── Filter signals ────────────────────────────────────
  searchQuery  = signal('');
  filterRole   = signal<number | ''>('');
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');

  filteredUsers = computed(() => {
    let result = this.users();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userId.toString() === q
      );
    }

    const role = this.filterRole();
    if (role !== '') result = result.filter(u => u.roleId === role);

    const status = this.filterStatus();
    if (status === 'active')   result = result.filter(u =>  u.statusId);
    if (status === 'inactive') result = result.filter(u => !u.statusId);

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery()  !== '' ||
    this.filterRole()   !== '' ||
    this.filterStatus() !== 'all'
  );

  // Add form
  newUser: UpsertUser = {
    userId: 0, username: '', roleId: 0,
    email: '', phone: '', adminName: '', isCreate: true
  };

  // Update form (pre-filled from row click)
  updateData: UpsertUser = {
    userId: 0, username: '', roleId: 0,
    email: '', phone: '', adminName: '', isCreate: false, statusId: true
  };

  // Feedback
  successMessage = signal('');
  errorMessage   = signal('');
  isLoading      = signal(false);

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadAll();
    this.loadRoles();
  }

  // ── Helpers ──────────────────────────────────────────

  getRoleName(user: User): string {
    return user.roleType
      || this.roles().find(r => r.roleId === user.roleId)?.roleType
      || UserRoleNames[user.roleId]
      || `Role ${user.roleId}`;
  }

  clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterRole.set('');
    this.filterStatus.set('all');
  }

  setView(view: ActiveView) {
    this.activeView.set(view);
    this.clearMessages();
  }

  private get loggedInUsername(): string {
    return this.authService.getRole() ?? 'Admin';
  }

  // ── Load All Users ────────────────────────────────────

  loadAll() {
    this.isLoading.set(true);
    this.clearMessages();
    this.userService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next:  (data) => this.users.set(data),
        error: (err)  => this.errorMessage.set(err.error?.message ?? 'Failed to fetch users.')
      });
  }

  // ── Load Roles ────────────────────────────────────────

  loadRoles() {
    this.userService.getRoles().subscribe({
      next:  (data) => this.roles.set(data),
      error: () => {} // silently fall back to UserRoleNames
    });
  }

  // ── Add ──────────────────────────────────────────────

  private readonly phonePattern = /^[0-9]{10}$/;

  addUser() {
    if (!this.newUser.username.trim())             { this.errorMessage.set('Username is required (min 3 characters).'); return; }
    if (this.newUser.username.trim().length < 3)   { this.errorMessage.set('Username must be at least 3 characters.'); return; }
    if (!this.newUser.email.trim())                { this.errorMessage.set('Email is required.'); return; }
    if (!this.newUser.phone.trim())                { this.errorMessage.set('Phone is required.'); return; }
    if (!this.phonePattern.test(this.newUser.phone)) { this.errorMessage.set('Phone must be exactly 10 digits.'); return; }
    if (!this.newUser.roleId)                      { this.errorMessage.set('Role is required.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    this.userService.create({ ...this.newUser, adminName: this.loggedInUsername })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'User created successfully!');
          this.newUser = { userId: 0, username: '', roleId: 0, email: '', phone: '', adminName: '', isCreate: true };
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.error ?? err.error?.message ?? 'Failed to create user.')
      });
  }

  // ── Inline Update ────────────────────────────────────

  openUpdate(user: User) {
    this.updateData = {
      userId:    user.userId,
      username:  user.username,
      roleId:    user.roleId,
      email:     user.email,
      phone:     user.phone,
      adminName: this.loggedInUsername,
      isCreate:  false,
      statusId:  user.statusId,
    };
    this.setView('update');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateUser() {
    if (!this.updateData.username.trim())               { this.errorMessage.set('Username is required (min 3 characters).'); return; }
    if (this.updateData.username.trim().length < 3)     { this.errorMessage.set('Username must be at least 3 characters.'); return; }
    if (!this.updateData.email.trim())                  { this.errorMessage.set('Email is required.'); return; }
    if (!this.updateData.phone.trim())                  { this.errorMessage.set('Phone is required.'); return; }
    if (!this.phonePattern.test(this.updateData.phone)) { this.errorMessage.set('Phone must be exactly 10 digits.'); return; }
    if (!this.updateData.roleId)                        { this.errorMessage.set('Role is required.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    this.userService.update(this.updateData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'User updated successfully!');
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.error ?? err.error?.message ?? 'Failed to update user.')
      });
  }
}
