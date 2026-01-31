import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { DocumentService } from '../../core/services/document.service';
import { ProposalService } from '../../core/services/proposal.service';
import { Project, DocumentSummary, ProjectMember, ProposalSummary } from '../../core/models';

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
  pendingProposals = signal<ProposalSummary[]>([]);
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
    private documentService: DocumentService,
    private proposalService: ProposalService
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
        this.loadPendingProposals();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadPendingProposals(): void {
    // Load pending proposals for all documents in the project
    const docs = this.documents();
    if (docs.length === 0) {
      this.isLoading.set(false);
      return;
    }

    // For now, load proposals for the first document
    // In a real app, you'd aggregate across all documents or have a project-level endpoint
    const allProposals: ProposalSummary[] = [];
    let completed = 0;

    docs.forEach(doc => {
      this.proposalService.getProposals(doc.id, 'Pending' as any).subscribe({
        next: (proposals) => {
          allProposals.push(...proposals);
          completed++;
          if (completed === docs.length) {
            this.pendingProposals.set(allProposals);
            this.isLoading.set(false);
          }
        },
        error: () => {
          completed++;
          if (completed === docs.length) {
            this.pendingProposals.set(allProposals);
            this.isLoading.set(false);
          }
        }
      });
    });
  }

  formatWordCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
