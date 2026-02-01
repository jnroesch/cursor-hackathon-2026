import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, UpdateProfileRequest } from '../../core/models';

interface DashboardData {
  projectsPublished: number;
  projectsInProgress: number;
  totalRevenue: number;
  copiesSold: number;
  thisMonthRevenue: number;
  monthlyGrowth: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  // Expose Math for template
  Math = Math;

  // Dashboard placeholder data
  dashboardData: DashboardData = {
    projectsPublished: 3,
    projectsInProgress: 2,
    totalRevenue: 12450,
    copiesSold: 847,
    thisMonthRevenue: 1280,
    monthlyGrowth: 15.3
  };

  // Predefined roles
  readonly predefinedRoles = [
    'character designer',
    'dialogue specialist',
    'plot crafter',
    'world builder'
  ];

  // Form data
  displayName = '';
  selectedRoles = signal<string[]>([]);
  favoriteMedia = '';
  aboutMe = '';
  customRoleInput = '';

  // Original data for change detection
  private originalData: Partial<User> = {};

  // Loading states
  isLoading = signal(true);
  isSaving = signal(false);

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.displayName = user.displayName || '';
        this.selectedRoles.set(user.roles || []);
        this.favoriteMedia = user.favoriteMedia || '';
        this.aboutMe = user.aboutMe || '';
        
        // Store original data for change detection
        this.originalData = {
          displayName: user.displayName || '',
          roles: user.roles || [],
          favoriteMedia: user.favoriteMedia || '',
          aboutMe: user.aboutMe || ''
        };
        
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Check if form has changes
  hasChanges = computed(() => {
    const current = {
      displayName: this.displayName.trim(),
      roles: [...this.selectedRoles()].sort(),
      favoriteMedia: (this.favoriteMedia || '').trim(),
      aboutMe: (this.aboutMe || '').trim()
    };

    const original = {
      displayName: (this.originalData.displayName || '').trim(),
      roles: [...(this.originalData.roles || [])].sort(),
      favoriteMedia: (this.originalData.favoriteMedia || '').trim(),
      aboutMe: (this.originalData.aboutMe || '').trim()
    };

    return JSON.stringify(current) !== JSON.stringify(original);
  });

  // Get available roles (predefined + custom, excluding already selected)
  getAvailableRoles(): string[] {
    const selected = this.selectedRoles();
    return this.predefinedRoles.filter(role => !selected.includes(role));
  }

  // Add a role
  addRole(role: string): void {
    if (role.trim() && !this.selectedRoles().includes(role.trim())) {
      this.selectedRoles.set([...this.selectedRoles(), role.trim()]);
    }
  }

  // Remove a role
  removeRole(role: string): void {
    this.selectedRoles.set(this.selectedRoles().filter(r => r !== role));
  }

  // Add custom role
  addCustomRole(): void {
    if (this.customRoleInput.trim()) {
      this.addRole(this.customRoleInput.trim());
      this.customRoleInput = '';
    }
  }

  // Save profile
  saveProfile(): void {
    if (!this.hasChanges() || this.isSaving()) return;

    this.isSaving.set(true);
    const request: UpdateProfileRequest = {
      displayName: this.displayName.trim(),
      roles: this.selectedRoles().length > 0 ? this.selectedRoles() : undefined,
      favoriteMedia: this.favoriteMedia.trim() || undefined,
      aboutMe: this.aboutMe.trim() || undefined
    };

    this.authService.updateProfile(request).subscribe({
      next: (user) => {
        // Update form fields to match server response
        this.displayName = user.displayName || '';
        this.selectedRoles.set(user.roles || []);
        this.favoriteMedia = user.favoriteMedia || '';
        this.aboutMe = user.aboutMe || '';
        
        // Update original data
        this.originalData = {
          displayName: user.displayName || '',
          roles: user.roles || [],
          favoriteMedia: user.favoriteMedia || '',
          aboutMe: user.aboutMe || ''
        };
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }
}
