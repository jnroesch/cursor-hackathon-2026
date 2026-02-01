import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { ProposalService } from '../../../core/services/proposal.service';
import { Document as InkspireDocument, UserDraft } from '../../../core/models';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

@Component({
  selector: 'app-editor-embed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor-embed.component.html',
  styleUrl: './editor-embed.component.css'
})
export class EditorEmbedComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorElement') editorElement!: ElementRef;
  
  @Input() documentId!: string;
  @Input() projectId!: string;
  @Input() showHeadlineNav: boolean = false;
  
  @Output() contentChange = new EventEmitter<any>();
  
  document = signal<InkspireDocument | null>(null);
  draft = signal<UserDraft | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  hasUnsavedChanges = signal(false);
  lastSaved = signal<Date | null>(null);
  wordCount = signal(0);
  
  // Proposal modal
  showProposalModal = signal(false);
  proposalDescription = '';
  isSubmitting = signal(false);
  
  editor: Editor | null = null;
  private autoSaveInterval: any;

  constructor(
    private documentService: DocumentService,
    private proposalService: ProposalService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        setTimeout(() => this.initEditor(draft?.draftContent || this.document()?.liveContent), 0);
      },
      error: () => {
        this.isLoading.set(false);
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
        // Emit content for headline navigation
        this.contentChange.emit(editor.getJSON());
      }
    });

    this.updateWordCount(this.editor);
    // Emit initial content
    this.contentChange.emit(this.editor.getJSON());
    
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
  toggleBold(): void { this.editor?.chain().focus().toggleBold().run(); }
  toggleItalic(): void { this.editor?.chain().focus().toggleItalic().run(); }
  toggleUnderline(): void { this.editor?.chain().focus().toggleUnderline().run(); }
  toggleStrike(): void { this.editor?.chain().focus().toggleStrike().run(); }
  toggleHighlight(): void { this.editor?.chain().focus().toggleHighlight().run(); }
  setHeading(level: 1 | 2 | 3): void { this.editor?.chain().focus().toggleHeading({ level }).run(); }
  setParagraph(): void { this.editor?.chain().focus().setParagraph().run(); }
  toggleBulletList(): void { this.editor?.chain().focus().toggleBulletList().run(); }
  toggleOrderedList(): void { this.editor?.chain().focus().toggleOrderedList().run(); }
  toggleBlockquote(): void { this.editor?.chain().focus().toggleBlockquote().run(); }
  setTextAlign(align: 'left' | 'center' | 'right' | 'justify'): void { 
    this.editor?.chain().focus().setTextAlign(align).run(); 
  }
  undo(): void { this.editor?.chain().focus().undo().run(); }
  redo(): void { this.editor?.chain().focus().redo().run(); }

  isActive(name: string | Record<string, any>, attributes?: any): boolean {
    if (typeof name === 'string') {
      return this.editor?.isActive(name, attributes) || false;
    }
    return this.editor?.isActive(name) || false;
  }

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

  openProposalModal(): void {
    this.proposalDescription = '';
    this.showProposalModal.set(true);
  }

  closeProposalModal(): void {
    this.showProposalModal.set(false);
  }

  submitForReview(): void {
    if (!this.editor || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const content = this.editor.getJSON();

    this.documentService.saveDraft(this.documentId, { content }).subscribe({
      next: () => {
        this.proposalService.createProposal(
          this.documentId, 
          this.proposalDescription.trim() || undefined
        ).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.showProposalModal.set(false);
            this.hasUnsavedChanges.set(false);
            // Navigate to review tab
            this.router.navigate(['/project', this.projectId], { 
              queryParams: { tab: 'review' } 
            });
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

  focusEditor(event: MouseEvent): void {
    // Only focus if clicking on the background area, not on the editor itself
    const target = event.target as HTMLElement;
    if (target.classList.contains('editor-content-area') || 
        target.classList.contains('max-w-3xl') ||
        target.classList.contains('py-12')) {
      this.editor?.chain().focus().run();
    }
  }
}