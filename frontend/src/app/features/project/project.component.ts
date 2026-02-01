import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { DocumentService } from '../../core/services/document.service';
import { ProposalService } from '../../core/services/proposal.service';
import { AuthService } from '../../core/services/auth.service';
import { Project, DocumentSummary, ProjectMember, ProposalSummary, VoteType } from '../../core/models';

// Activity item for the recent activity feed
interface ActivityItem {
  id: string;
  type: 'document_created' | 'proposal_submitted' | 'proposal_accepted' | 'proposal_rejected' | 'member_joined';
  title: string;
  description: string;
  author?: string;
  timestamp: string;
  icon: 'document' | 'proposal' | 'check' | 'x' | 'user';
}

// Extended proposal summary with document ID for navigation
interface ProposalWithDocument extends ProposalSummary {
  documentId: string;
}

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
  pendingProposals = signal<ProposalWithDocument[]>([]);
  allProposals = signal<ProposalWithDocument[]>([]);
  isLoading = signal(true);
  projectId: string = '';

  // Computed recent activity from documents and proposals
  recentActivity = computed<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];
    
    // Add documents as activity (using updatedAt as we don't have createdAt in summary)
    this.documents().forEach(doc => {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'document_created',
        title: 'Document updated',
        description: doc.title,
        timestamp: doc.updatedAt || new Date().toISOString(),
        icon: 'document'
      });
    });

    // Add proposals as activity
    this.allProposals().forEach(proposal => {
      if (proposal.status === 'Pending') {
        activities.push({
          id: `prop-${proposal.id}`,
          type: 'proposal_submitted',
          title: 'Proposal submitted',
          description: proposal.description || 'New change proposal',
          author: proposal.author.displayName,
          timestamp: proposal.createdAt,
          icon: 'proposal'
        });
      } else if (proposal.status === 'Accepted') {
        activities.push({
          id: `prop-${proposal.id}`,
          type: 'proposal_accepted',
          title: 'Proposal accepted',
          description: proposal.description || 'Change proposal approved',
          author: proposal.author.displayName,
          timestamp: proposal.createdAt,
          icon: 'check'
        });
      } else if (proposal.status === 'Rejected') {
        activities.push({
          id: `prop-${proposal.id}`,
          type: 'proposal_rejected',
          title: 'Proposal rejected',
          description: proposal.description || 'Change proposal rejected',
          author: proposal.author.displayName,
          timestamp: proposal.createdAt,
          icon: 'x'
        });
      }
    });

    // Sort by timestamp descending and limit to 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  });

  // Modal states
  showTeamModal = signal(false);
  isInviting = signal(false);
  isVoting = signal(false);

  // Form data
  inviteEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private documentService: DocumentService,
    private proposalService: ProposalService,
    private authService: AuthService
  ) {}

  // Check if current user is the author of a proposal
  isOwnProposal(proposal: ProposalWithDocument): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id === proposal.author.id;
  }

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
        this.loadMembersCount();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadMembersCount(): void {
    this.projectService.getMembers(this.projectId).subscribe({
      next: (members) => {
        this.members.set(members);
      }
    });
  }

  loadDocuments(): void {
    this.documentService.getProjectDocuments(this.projectId).subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.loadAllProposals();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadAllProposals(): void {
    // Load all proposals for all documents in the project
    const docs = this.documents();
    if (docs.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const allProposals: ProposalWithDocument[] = [];
    let completed = 0;

    docs.forEach(doc => {
      // Get all proposals (not filtered by status)
      this.proposalService.getProposals(doc.id).subscribe({
        next: (proposals) => {
          // Add documentId to each proposal for navigation
          const proposalsWithDoc = proposals.map(p => ({ ...p, documentId: doc.id }));
          allProposals.push(...proposalsWithDoc);
          completed++;
          if (completed === docs.length) {
            this.allProposals.set(allProposals);
            // Filter pending proposals
            this.pendingProposals.set(allProposals.filter(p => p.status === 'Pending'));
            this.isLoading.set(false);
          }
        },
        error: () => {
          completed++;
          if (completed === docs.length) {
            this.allProposals.set(allProposals);
            this.pendingProposals.set(allProposals.filter(p => p.status === 'Pending'));
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

  getTotalWordCount(): number {
    return this.documents().reduce((sum, doc) => sum + (doc.wordCount || 0), 0);
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

  // Voting
  getApprovePercentage(proposal: ProposalSummary): number {
    const total = proposal.approveCount + proposal.rejectCount;
    if (total === 0) return 0;
    return (proposal.approveCount / total) * 100;
  }

  getRejectPercentage(proposal: ProposalSummary): number {
    const total = proposal.approveCount + proposal.rejectCount;
    if (total === 0) return 0;
    return (proposal.rejectCount / total) * 100;
  }

  voteOnProposal(proposalId: string, voteType: 'Approve' | 'Reject'): void {
    this.isVoting.set(true);
    this.proposalService.castVote(proposalId, { 
      vote: voteType as VoteType 
    }).subscribe({
      next: () => {
        this.isVoting.set(false);
        // Reload proposals to get updated vote counts
        this.loadAllProposals();
      },
      error: (err) => {
        this.isVoting.set(false);
        console.error('Failed to cast vote:', err);
      }
    });
  }

  // View proposal details - navigate to editor in diff view mode
  viewProposalDetails(proposal: ProposalWithDocument): void {
    this.router.navigate(['/editor', proposal.documentId, 'proposal', proposal.id]);
  }
}
