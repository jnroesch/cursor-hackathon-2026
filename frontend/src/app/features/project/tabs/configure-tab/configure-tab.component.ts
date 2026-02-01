import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, ProjectMember } from '../../../../core/models';

@Component({
  selector: 'app-configure-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configure-tab.component.html',
  styleUrl: './configure-tab.component.css'
})
export class ConfigureTabComponent {
  @Input() project: Project | null = null;
  @Input() members: ProjectMember[] = [];
  @Input() currentUserId: string = '';
  
  @Output() updateProject = new EventEmitter<{ title: string, description: string }>();
  @Output() inviteMember = new EventEmitter<string>();
  @Output() removeMember = new EventEmitter<string>();
  @Output() leaveProject = new EventEmitter<void>();
  @Output() voteToDelete = new EventEmitter<void>();
  
  // Form states
  isEditingProject = signal(false);
  projectTitle = signal('');
  projectDescription = signal('');
  
  inviteEmail = '';
  isInviting = signal(false);
  inviteError = signal<string | null>(null);
  
  // Edit mode
  startEditing(): void {
    this.projectTitle.set(this.project?.title || '');
    this.projectDescription.set(this.project?.description || '');
    this.isEditingProject.set(true);
  }
  
  cancelEditing(): void {
    this.isEditingProject.set(false);
  }
  
  saveProjectChanges(): void {
    if (this.projectTitle().trim()) {
      this.updateProject.emit({
        title: this.projectTitle().trim(),
        description: this.projectDescription().trim()
      });
      this.isEditingProject.set(false);
    }
  }
  
  // Team management
  onInviteMember(): void {
    if (this.inviteEmail.trim()) {
      this.isInviting.set(true);
      this.inviteError.set(null);
      this.inviteMember.emit(this.inviteEmail.trim());
      // Reset will happen after parent confirms success
    }
  }
  
  resetInvite(): void {
    this.inviteEmail = '';
    this.isInviting.set(false);
  }
  
  setInviteError(error: string): void {
    this.inviteError.set(error);
    this.isInviting.set(false);
  }
  
  onRemoveMember(userId: string): void {
    if (confirm('Are you sure you want to remove this member from the project?')) {
      this.removeMember.emit(userId);
    }
  }
  
  // Project actions
  onLeaveProject(): void {
    if (confirm('Are you sure you want to leave this project? You will lose all access and contributions.')) {
      this.leaveProject.emit();
    }
  }
  
  onVoteToDelete(): void {
    if (confirm('Vote to delete this project? This action requires majority approval from all members.')) {
      this.voteToDelete.emit();
    }
  }
  
  // Helper
  isOwner(): boolean {
    return this.members.some(m => m.userId === this.currentUserId && m.role === 'Owner');
  }
}
