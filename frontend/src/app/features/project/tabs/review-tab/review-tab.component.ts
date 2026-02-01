import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProposalSummary, VoteType } from '../../../../core/models';

// Extended proposal summary with document ID for navigation
export interface ProposalWithDocument extends ProposalSummary {
  documentId: string;
}

// Activity item for the recent activity feed
export interface ActivityItem {
  id: string;
  type: 'document_created' | 'proposal_submitted' | 'proposal_accepted' | 'proposal_rejected' | 'member_joined';
  title: string;
  description: string;
  author?: string;
  timestamp: string;
  icon: 'document' | 'proposal' | 'check' | 'x' | 'user';
}

@Component({
  selector: 'app-review-tab',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './review-tab.component.html',
  styleUrl: './review-tab.component.css'
})
export class ReviewTabComponent {
  @Input() pendingProposals: ProposalWithDocument[] = [];
  @Input() recentActivity: ActivityItem[] = [];
  @Input() currentUserId: string = '';
  @Input() isVoting: boolean = false;
  
  @Output() voteOnProposal = new EventEmitter<{ proposalId: string, voteType: 'Approve' | 'Reject' }>();
  @Output() viewProposalDetails = new EventEmitter<ProposalWithDocument>();
  
  isOwnProposal(proposal: ProposalWithDocument): boolean {
    return this.currentUserId === proposal.author.id;
  }
  
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
  
  onVote(proposalId: string, voteType: 'Approve' | 'Reject'): void {
    this.voteOnProposal.emit({ proposalId, voteType });
  }
  
  onViewProposal(proposal: ProposalWithDocument): void {
    this.viewProposalDetails.emit(proposal);
  }
}
