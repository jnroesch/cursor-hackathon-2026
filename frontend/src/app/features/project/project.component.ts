import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { DocumentService } from '../../core/services/document.service';
import { ProposalService } from '../../core/services/proposal.service';
import { AuthService } from '../../core/services/auth.service';
import { Project, DocumentSummary, ProjectMember, ProposalSummary, Proposal, VoteType, Document } from '../../core/models';

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
  allProposals = signal<ProposalSummary[]>([]);
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
  showProposalDetailModal = signal(false);
  isInviting = signal(false);
  isVoting = signal(false);
  isLoadingProposal = signal(false);

  // Proposal detail
  selectedProposal = signal<Proposal | null>(null);
  selectedDocument = signal<Document | null>(null);

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
  isOwnProposal(proposal: ProposalSummary): boolean {
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

    const allProposals: ProposalSummary[] = [];
    let completed = 0;

    docs.forEach(doc => {
      // Get all proposals (not filtered by status)
      this.proposalService.getProposals(doc.id).subscribe({
        next: (proposals) => {
          allProposals.push(...proposals);
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

  // View proposal details
  viewProposalDetails(proposalSummary: ProposalSummary): void {
    this.isLoadingProposal.set(true);
    this.showProposalDetailModal.set(true);

    // Load full proposal details
    this.proposalService.getProposal(proposalSummary.id).subscribe({
      next: (proposal) => {
        this.selectedProposal.set(proposal);
        // Load the document to get original content
        this.documentService.getDocument(proposal.documentId).subscribe({
          next: (doc) => {
            this.selectedDocument.set(doc);
            this.isLoadingProposal.set(false);
          },
          error: () => {
            this.isLoadingProposal.set(false);
          }
        });
      },
      error: () => {
        this.isLoadingProposal.set(false);
      }
    });
  }

  closeProposalDetailModal(): void {
    this.showProposalDetailModal.set(false);
    this.selectedProposal.set(null);
    this.selectedDocument.set(null);
  }

  // Extract plain text from TipTap JSON for simple diff display
  extractTextFromContent(content: any): string {
    if (!content) return '';
    
    const extractText = (node: any): string => {
      if (!node) return '';
      
      if (node.type === 'text') {
        return node.text || '';
      }
      
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      
      // Add line breaks for block elements
      if (['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(node.type)) {
        const text = node.content ? node.content.map(extractText).join('') : '';
        return text + '\n';
      }
      
      return '';
    };
    
    return extractText(content).trim();
  }

  // Compute diff using Longest Common Subsequence (LCS) algorithm
  getTextDiff(original: string, proposed: string): { type: 'same' | 'added' | 'removed'; text: string }[] {
    const originalLines = original.split('\n').filter(line => line.length > 0 || original.includes('\n'));
    const proposedLines = proposed.split('\n').filter(line => line.length > 0 || proposed.includes('\n'));
    
    // Build LCS table
    const lcs = this.computeLCS(originalLines, proposedLines);
    
    // Backtrack to build the diff
    return this.buildDiffFromLCS(originalLines, proposedLines, lcs);
  }

  // Compute LCS (Longest Common Subsequence) table
  private computeLCS(original: string[], proposed: string[]): number[][] {
    const m = original.length;
    const n = proposed.length;
    
    // Create table with dimensions (m+1) x (n+1)
    const table: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Fill the table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (original[i - 1] === proposed[j - 1]) {
          table[i][j] = table[i - 1][j - 1] + 1;
        } else {
          table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
        }
      }
    }
    
    return table;
  }

  // Build diff by backtracking through LCS table
  private buildDiffFromLCS(
    original: string[], 
    proposed: string[], 
    lcs: number[][]
  ): { type: 'same' | 'added' | 'removed'; text: string }[] {
    const diff: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
    
    let i = original.length;
    let j = proposed.length;
    
    // Backtrack from bottom-right corner
    const tempDiff: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && original[i - 1] === proposed[j - 1]) {
        // Lines are the same
        tempDiff.unshift({ type: 'same', text: original[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        // Line was added in proposed
        tempDiff.unshift({ type: 'added', text: proposed[j - 1] });
        j--;
      } else if (i > 0) {
        // Line was removed from original
        tempDiff.unshift({ type: 'removed', text: original[i - 1] });
        i--;
      }
    }
    
    return tempDiff;
  }
}
