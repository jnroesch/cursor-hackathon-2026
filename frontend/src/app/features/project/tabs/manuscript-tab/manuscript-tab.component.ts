import { Component, Input, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentSummary } from '../../../../core/models';
import { HeadlineNavigationComponent } from '../../components/headline-navigation/headline-navigation.component';
import { EditorEmbedComponent } from '../../../editor/editor-embed/editor-embed.component';

@Component({
  selector: 'app-manuscript-tab',
  standalone: true,
  imports: [CommonModule, RouterModule, HeadlineNavigationComponent, EditorEmbedComponent],
  templateUrl: './manuscript-tab.component.html',
  styleUrl: './manuscript-tab.component.css'
})
export class ManuscriptTabComponent implements OnInit {
  @Input() projectId: string = '';
  @Input() documents: DocumentSummary[] = [];
  
  // Filter only manuscript documents
  manuscriptDocuments = computed(() => 
    this.documents.filter(doc => doc.documentType === 'Manuscript')
  );
  
  // Currently selected document for editing
  selectedDocumentId = signal<string | null>(null);
  
  // Editor content for headline extraction
  editorContent = signal<any>(null);

  constructor() {
    // Watch for document changes and auto-select first one
    effect(() => {
      const manuscripts = this.manuscriptDocuments();
      if (manuscripts.length > 0 && !this.selectedDocumentId()) {
        this.selectedDocumentId.set(manuscripts[0].id);
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
