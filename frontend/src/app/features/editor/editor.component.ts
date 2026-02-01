import { Component, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, ParamMap } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DocumentService } from '../../core/services/document.service';
import { ProposalService } from '../../core/services/proposal.service';
import { AuthService } from '../../core/services/auth.service';
import { Document as InkspireDocument, UserDraft, Proposal, VoteType } from '../../core/models';
import { ConsistencyCheckResult, ConsistencyIssue, IssueSeverity, IssueCategory } from '../../core/models/proposal.model';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { DiffInserted, DiffDeleted } from './diff-marks';
import { computeDiffContent } from './diff-utils';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorElement') editorElement!: ElementRef;
  
  document = signal<InkspireDocument | null>(null);
  draft = signal<UserDraft | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isSubmitting = signal(false);
  hasUnsavedChanges = signal(false);
  lastSaved = signal<Date | null>(null);
  wordCount = signal(0);
  
  // Proposal modal
  showProposalModal = signal(false);
  proposalDescription = '';
  
  // AI Consistency check
  isCheckingConsistency = signal(false);
  consistencyResult = signal<ConsistencyCheckResult | null>(null);
  consistencyCheckCompleted = signal(false);
  
  // Computed property for issue counts
  errorCount = computed(() => {
    const result = this.consistencyResult();
    if (!result) return 0;
    return result.issues.filter(i => i.severity === IssueSeverity.Error).length;
  });
  
  warningCount = computed(() => {
    const result = this.consistencyResult();
    if (!result) return 0;
    return result.issues.filter(i => i.severity === IssueSeverity.Warning).length;
  });
  
  // Proposal view mode
  proposalId: string = '';
  proposal = signal<Proposal | null>(null);
  isVoting = signal(false);
  
  // Computed signal to check if we're in proposal view mode
  isProposalView = computed(() => !!this.proposalId && !!this.proposal());
  
  // Check if current user is the author of the proposal
  isOwnProposal = computed(() => {
    const currentUser = this.authService.currentUser();
    const proposal = this.proposal();
    return currentUser?.id === proposal?.authorId;
  });
  
  documentId: string = '';
  projectId: string = '';
  editor: Editor | null = null;
  
  private autoSaveInterval: any;
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private proposalService: ProposalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes to handle navigation between proposal/document views
    this.routeSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      const newDocumentId = params.get('documentId') || '';
      const newProposalId = params.get('proposalId') || '';
      
      const documentChanged = newDocumentId !== this.documentId;
      const proposalChanged = newProposalId !== this.proposalId;
      
      this.documentId = newDocumentId;
      this.proposalId = newProposalId;
      
      // If navigating away from proposal view (proposalId cleared), reset proposal state
      if (proposalChanged && !newProposalId) {
        this.proposal.set(null);
        // Destroy and recreate editor for fresh state
        if (this.editor) {
          this.editor.destroy();
          this.editor = null;
        }
      }
      
      if (this.documentId && (documentChanged || proposalChanged)) {
        this.isLoading.set(true);
        this.loadDocument();
      }
    });
  }

  ngAfterViewInit(): void {
    // Editor will be initialized after document loads
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadDocument(): void {
    this.documentService.getDocument(this.documentId).subscribe({
      next: (doc) => {
        this.document.set(doc);
        this.projectId = doc.projectId;
        
        // If viewing a proposal, load it instead of the draft
        if (this.proposalId) {
          this.loadProposal();
        } else {
          this.loadDraft();
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  loadProposal(): void {
    this.proposalService.getProposal(this.proposalId).subscribe({
      next: (proposal) => {
        this.proposal.set(proposal);
        this.isLoading.set(false);
        
        // Compute diff content and initialize editor in read-only mode
        const originalContent = this.document()?.liveContent;
        const proposedContent = proposal.proposedContent;
        const diffContent = computeDiffContent(originalContent, proposedContent);
        
        setTimeout(() => this.initDiffEditor(diffContent), 0);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadDraft(): void {
    this.documentService.getDraft(this.documentId).subscribe({
      next: (draft) => {
        this.draft.set(draft);
        this.isLoading.set(false);
        // Initialize editor after view is ready
        setTimeout(() => this.initEditor(draft?.draftContent || this.document()?.liveContent), 0);
      },
      error: () => {
        this.isLoading.set(false);
        // Initialize editor with document content if no draft exists
        setTimeout(() => this.initEditor(this.document()?.liveContent), 0);
      }
    });
  }

  initEditor(content?: any): void {
    if (this.editor) {
      this.editor.destroy();
    }

    this.editor = new Editor({
      element: this.editorElement?.nativeElement,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3]
          }
        }),
        Placeholder.configure({
          placeholder: 'Start writing your masterpiece...'
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        Highlight.configure({
          multicolor: false
        })
      ],
      content: content || '<p></p>',
      editorProps: {
        attributes: {
          class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px]'
        }
      },
      onUpdate: ({ editor }) => {
        this.hasUnsavedChanges.set(true);
        this.updateWordCount(editor);
      }
    });

    this.updateWordCount(this.editor);
    
    // Auto-save every 30 seconds (only in edit mode)
    if (!this.proposalId) {
      this.autoSaveInterval = setInterval(() => {
        if (this.hasUnsavedChanges()) {
          this.saveDraft();
        }
      }, 30000);
    }
  }
  
  initDiffEditor(content: any): void {
    if (this.editor) {
      this.editor.destroy();
    }

    this.editor = new Editor({
      element: this.editorElement?.nativeElement,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3]
          }
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        Highlight.configure({
          multicolor: false
        }),
        // Add diff mark extensions
        DiffInserted,
        DiffDeleted
      ],
      content: content || '<p></p>',
      editable: false, // Read-only mode for diff view
      editorProps: {
        attributes: {
          class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px]'
        }
      }
    });

    this.updateWordCount(this.editor);
  }

  updateWordCount(editor: Editor): void {
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    this.wordCount.set(words);
  }

  // Toolbar actions
  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleHighlight(): void {
    this.editor?.chain().focus().toggleHighlight().run();
  }

  setHeading(level: 1 | 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  setParagraph(): void {
    this.editor?.chain().focus().setParagraph().run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  setTextAlign(align: 'left' | 'center' | 'right' | 'justify'): void {
    this.editor?.chain().focus().setTextAlign(align).run();
  }

  undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  // Check if format is active
  isActive(name: string | Record<string, any>, attributes?: any): boolean {
    if (typeof name === 'string') {
      return this.editor?.isActive(name, attributes) || false;
    }
    return this.editor?.isActive(name) || false;
  }

  // Save draft
  saveDraft(): void {
    if (!this.editor || this.isSaving()) return;

    this.isSaving.set(true);
    const content = this.editor.getJSON();

    this.documentService.saveDraft(this.documentId, { content }).subscribe({
      next: (draft) => {
        this.draft.set(draft);
        this.hasUnsavedChanges.set(false);
        this.lastSaved.set(new Date());
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }

  // Submit for review modal
  openProposalModal(): void {
    this.proposalDescription = '';
    this.consistencyResult.set(null);
    this.consistencyCheckCompleted.set(false);
    this.showProposalModal.set(true);
    
    // Start the AI consistency check
    this.runConsistencyCheck();
  }

  closeProposalModal(): void {
    this.showProposalModal.set(false);
    this.consistencyResult.set(null);
    this.consistencyCheckCompleted.set(false);
  }
  
  runConsistencyCheck(): void {
    if (!this.editor || this.isCheckingConsistency()) return;
    
    this.isCheckingConsistency.set(true);
    const content = this.editor.getJSON();
    
    // First save the draft, then run the consistency check
    this.documentService.saveDraft(this.documentId, { content }).subscribe({
      next: () => {
        this.documentService.checkConsistency(this.documentId).subscribe({
          next: (result) => {
            this.consistencyResult.set(result);
            this.consistencyCheckCompleted.set(true);
            this.isCheckingConsistency.set(false);
          },
          error: () => {
            // If check fails, still allow submission
            this.consistencyCheckCompleted.set(true);
            this.isCheckingConsistency.set(false);
          }
        });
      },
      error: () => {
        this.consistencyCheckCompleted.set(true);
        this.isCheckingConsistency.set(false);
      }
    });
  }
  
  // Helper to get category icon
  getCategoryIcon(category: IssueCategory): string {
    switch (category) {
      case IssueCategory.Character: return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      case IssueCategory.World: return 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case IssueCategory.Plot: return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case IssueCategory.Timeline: return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case IssueCategory.Style: return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  submitForReview(): void {
    if (!this.editor || this.isSubmitting()) return;

    // First, save the draft to ensure it's up to date
    this.isSubmitting.set(true);
    const content = this.editor.getJSON();

    this.documentService.saveDraft(this.documentId, { content }).subscribe({
      next: () => {
        // Now create the proposal - the backend will compute the diff from the draft
        // and run a final AI consistency check
        this.proposalService.createProposal(
          this.documentId, 
          this.proposalDescription.trim() || undefined
        ).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.showProposalModal.set(false);
            this.hasUnsavedChanges.set(false);
            this.router.navigate(['/project', this.projectId]);
          },
          error: () => {
            this.isSubmitting.set(false);
          }
        });
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  // Voting on proposals
  voteOnProposal(voteType: 'Approve' | 'Reject'): void {
    if (!this.proposalId || this.isVoting()) return;
    
    this.isVoting.set(true);
    this.proposalService.castVote(this.proposalId, { 
      vote: voteType as VoteType 
    }).subscribe({
      next: () => {
        this.isVoting.set(false);
        // Reload proposal to get updated status
        this.proposalService.getProposal(this.proposalId).subscribe({
          next: (proposal) => {
            this.proposal.set(proposal);
            
            // If proposal was accepted or rejected, navigate to the document to show the result
            if (proposal.status === 'Accepted' || proposal.status === 'Rejected') {
              // Navigate to the document view (without proposal) to show the merged/current content
              this.router.navigate(['/editor', this.documentId]);
            }
          }
        });
      },
      error: () => {
        this.isVoting.set(false);
      }
    });
  }

  // Format date for display
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

  // Navigation
  goBack(): void {
    // In proposal view mode, don't prompt for unsaved changes
    if (this.isProposalView()) {
      this.router.navigate(['/project', this.projectId]);
      return;
    }
    
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Do you want to save before leaving?')) {
        this.saveDraft();
      }
    }
    this.router.navigate(['/project', this.projectId]);
  }
}
