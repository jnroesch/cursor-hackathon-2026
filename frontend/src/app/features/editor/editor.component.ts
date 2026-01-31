import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { Document as InkspireDocument, UserDraft } from '../../core/models';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit {
  document = signal<InkspireDocument | null>(null);
  draft = signal<UserDraft | null>(null);
  isLoading = signal(true);
  documentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('documentId') || '';
    if (this.documentId) {
      this.loadDocument();
    }
  }

  loadDocument(): void {
    // Load both live document and user's draft
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
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
