import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeadlineItem {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  position: number;
}

@Component({
  selector: 'app-headline-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './headline-navigation.component.html',
  styleUrl: './headline-navigation.component.css'
})
export class HeadlineNavigationComponent implements OnChanges {
  @Input() editorContent: any = null;
  
  headlines = signal<HeadlineItem[]>([]);
  activeHeadlineId = signal<string | null>(null);
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editorContent'] && this.editorContent) {
      this.extractHeadlines();
    }
  }
  
  extractHeadlines(): void {
    const extractedHeadlines: HeadlineItem[] = [];
    
    if (!this.editorContent || !this.editorContent.content) {
      this.headlines.set([]);
      return;
    }
    
    let position = 0;
    
    // Traverse TipTap JSON content
    const traverse = (nodes: any[]) => {
      nodes.forEach((node: any) => {
        if (node.type === 'heading' && [1, 2, 3].includes(node.attrs?.level)) {
          const text = this.extractTextFromNode(node);
          if (text.trim()) {
            extractedHeadlines.push({
              id: `heading-${position}`,
              level: node.attrs.level,
              text: text.trim(),
              position: position++
            });
          }
        }
        
        // Recursively traverse child nodes
        if (node.content && Array.isArray(node.content)) {
          traverse(node.content);
        }
      });
    };
    
    traverse(this.editorContent.content);
    this.headlines.set(extractedHeadlines);
  }
  
  extractTextFromNode(node: any): string {
    if (node.text) {
      return node.text;
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map((child: any) => this.extractTextFromNode(child)).join('');
    }
    
    return '';
  }
  
  scrollToHeadline(headline: HeadlineItem): void {
    this.activeHeadlineId.set(headline.id);
    
    // Find the element with this ID and scroll to it
    const element = document.getElementById(headline.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: try to find by text content
      // This is less reliable but works if IDs aren't set
      const allHeadings = document.querySelectorAll('h1, h2, h3');
      for (let i = 0; i < allHeadings.length; i++) {
        if (allHeadings[i].textContent?.trim() === headline.text) {
          allHeadings[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
    }
  }
  
  getIndentClass(level: number): string {
    switch (level) {
      case 1: return 'pl-0';
      case 2: return 'pl-4';
      case 3: return 'pl-8';
      default: return 'pl-0';
    }
  }
  
  getFontWeightClass(level: number): string {
    return level === 1 ? 'font-medium' : 'font-normal';
  }
}
