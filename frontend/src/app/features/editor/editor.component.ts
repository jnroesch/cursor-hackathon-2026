import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { ProposalService } from '../../core/services/proposal.service';
import { Document as InkspireDocument, UserDraft } from '../../core/models';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

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
  
  documentId: string = '';
  projectId: string = '';
  editor: Editor | null = null;
  
  private autoSaveInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private proposalService: ProposalService
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('documentId') || '';
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
        this.loadDraft();
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
    
    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveDraft();
      }
    }, 30000);
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

  // Navigation
  goBack(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Do you want to save before leaving?')) {
        this.saveDraft();
      }
    }
    this.router.navigate(['/project', this.projectId]);
  }
}
