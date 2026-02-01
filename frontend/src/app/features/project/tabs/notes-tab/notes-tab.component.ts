import { Component, Input, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentSummary } from '../../../../core/models';
import { HeadlineNavigationComponent } from '../../components/headline-navigation/headline-navigation.component';
import { EditorEmbedComponent } from '../../../editor/editor-embed/editor-embed.component';

@Component({
  selector: 'app-notes-tab',
  standalone: true,
  imports: [CommonModule, RouterModule, HeadlineNavigationComponent, EditorEmbedComponent],
  templateUrl: './notes-tab.component.html',
  styleUrl: './notes-tab.component.css'
})
export class NotesTabComponent implements OnInit {
  @Input() projectId: string = '';
  @Input() documents: DocumentSummary[] = [];
  
  // Filter only notes documents
  notesDocuments = computed(() => 
    this.documents.filter(doc => doc.documentType === 'Notes')
  );
  
  // Currently selected document for editing
  selectedDocumentId = signal<string | null>(null);
  
  // Editor content for headline extraction
  editorContent = signal<any>(null);

  constructor() {
    // Watch for document changes and auto-select first one
    effect(() => {
      const notes = this.notesDocuments();
      if (notes.length > 0 && !this.selectedDocumentId()) {
        this.selectedDocumentId.set(notes[0].id);
      }
    });
  }

  ngOnInit(): void {
    // Initial selection handled by effect
  }
  
  selectDocument(documentId: string): void {
    this.selectedDocumentId.set(documentId);
  }
  
  onEditorContentChange(content: any): void {
    this.editorContent.set(content);
  }
}
