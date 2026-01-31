import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectSummary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  projects = signal<ProjectSummary[]>([]);
  isLoading = signal(true);
  showCreateModal = signal(false);
  isCreating = signal(false);
  
  // New project form
  newProjectTitle = '';
  newProjectDescription = '';

  constructor(
    public authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatWordCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k words`;
    }
    return `${count} words`;
  }

  openCreateModal(): void {
    this.newProjectTitle = '';
    this.newProjectDescription = '';
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createProject(): void {
    if (!this.newProjectTitle.trim()) return;
    
    this.isCreating.set(true);
    this.projectService.createProject({
      title: this.newProjectTitle.trim(),
      description: this.newProjectDescription.trim() || undefined
    }).subscribe({
      next: (project) => {
        this.isCreating.set(false);
        this.showCreateModal.set(false);
        this.router.navigate(['/project', project.id]);
      },
      error: () => {
        this.isCreating.set(false);
      }
    });
  }
}
