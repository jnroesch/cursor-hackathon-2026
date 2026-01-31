import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { DocumentService } from '../../core/services/document.service';
import { Project, DocumentSummary, ProjectMember } from '../../core/models';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {
  project = signal<Project | null>(null);
  documents = signal<DocumentSummary[]>([]);
  members = signal<ProjectMember[]>([]);
  isLoading = signal(true);
  projectId: string = '';

  // Modal states
  showCreateDocModal = signal(false);
  showTeamModal = signal(false);
  isCreatingDoc = signal(false);
  isInviting = signal(false);

  // Form data
  newDocTitle = '';
  inviteEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    if (this.projectId) {
      this.loadProject();
    }
  }

  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loadDocuments();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadDocuments(): void {
    this.documentService.getProjectDocuments(this.projectId).subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  formatWordCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }

  // Document Modal
  openCreateDocModal(): void {
    this.newDocTitle = '';
    this.showCreateDocModal.set(true);
  }

  closeCreateDocModal(): void {
    this.showCreateDocModal.set(false);
  }

  createDocument(): void {
    if (!this.newDocTitle.trim()) return;

    this.isCreatingDoc.set(true);
    this.documentService.createDocument(this.projectId, {
      title: this.newDocTitle.trim()
    }).subscribe({
      next: (doc) => {
        this.isCreatingDoc.set(false);
        this.showCreateDocModal.set(false);
        this.router.navigate(['/editor', doc.id]);
      },
      error: () => {
        this.isCreatingDoc.set(false);
      }
    });
  }

  // Team Modal
  openTeamModal(): void {
    this.inviteEmail = '';
    this.loadMembers();
    this.showTeamModal.set(true);
  }

  closeTeamModal(): void {
    this.showTeamModal.set(false);
  }

  loadMembers(): void {
    this.projectService.getMembers(this.projectId).subscribe({
      next: (members) => {
        this.members.set(members);
      }
    });
  }

  inviteMember(): void {
    if (!this.inviteEmail.trim()) return;

    this.isInviting.set(true);
    this.projectService.inviteMember(this.projectId, {
      email: this.inviteEmail.trim(),
      role: 'Contributor'
    }).subscribe({
      next: () => {
        this.isInviting.set(false);
        this.inviteEmail = '';
        this.loadMembers();
      },
      error: () => {
        this.isInviting.set(false);
      }
    });
  }

  removeMember(userId: string): void {
    this.projectService.removeMember(this.projectId, userId).subscribe({
      next: () => {
        this.loadMembers();
      }
    });
  }
}
