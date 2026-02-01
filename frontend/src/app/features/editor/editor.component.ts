import { Component, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { ProposalService } from '../../core/services/proposal.service';
import { AuthService } from '../../core/services/auth.service';
import { Document as InkspireDocument, UserDraft, Proposal, VoteType } from '../../core/models';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private proposalService: ProposalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('documentId') || '';
    this.proposalId = this.route.snapshot.paramMap.get('proposalId') || '';
    
    if (this.documentId) {
      this.loadDocument();
    }
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
    this.showProposalModal.set(true);
  }

  closeProposalModal(): void {
    this.showProposalModal.set(false);
  }

  submitForReview(): void {
    if (!this.editor || this.isSubmitting()) return;

    // First, save the draft to ensure it's up to date
    this.isSubmitting.set(true);
    const content = this.editor.getJSON();

    this.documentService.saveDraft(this.documentId, { content }).subscribe({
      next: () => {
        // Now create the proposal - the backend will compute the diff from the draft
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
        // Reload proposal to get updated vote counts
        this.proposalService.getProposal(this.proposalId).subscribe({
          next: (proposal) => {
            this.proposal.set(proposal);
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
