/**
 * Utility functions for computing diffs between TipTap documents
 * and producing merged content with diff marks.
 */

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: any }[];
  attrs?: any;
}

interface DiffSegment {
  type: 'same' | 'added' | 'removed';
  text: string;
}

/**
 * Extract plain text from a TipTap document node.
 */
export function extractText(node: TipTapNode | null | undefined): string {
  if (!node) return '';
  
  if (node.type === 'text') {
    return node.text || '';
  }
  
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractText).join('');
  }
  
  return '';
}

/**
 * Compute LCS (Longest Common Subsequence) table for word arrays.
 */
function computeLCS(original: string[], proposed: string[]): number[][] {
  const m = original.length;
  const n = proposed.length;
  
  const table: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (original[i - 1] === proposed[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }
  
  return table;
}

/**
 * Build diff segments by backtracking through LCS table.
 */
function buildDiffFromLCS(
  original: string[], 
  proposed: string[], 
  lcs: number[][]
): DiffSegment[] {
  const diff: DiffSegment[] = [];
  
  let i = original.length;
  let j = proposed.length;
  
  const tempDiff: DiffSegment[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === proposed[j - 1]) {
      tempDiff.unshift({ type: 'same', text: original[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      tempDiff.unshift({ type: 'added', text: proposed[j - 1] });
      j--;
    } else if (i > 0) {
      tempDiff.unshift({ type: 'removed', text: original[i - 1] });
      i--;
    }
  }
  
  return tempDiff;
}

/**
 * Compute word-level diff between two texts.
 */
export function computeWordDiff(originalText: string, proposedText: string): DiffSegment[] {
  // Split by words while preserving whitespace
  const splitWords = (text: string): string[] => {
    const result: string[] = [];
    const regex = /(\S+|\s+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      result.push(match[0]);
    }
    return result;
  };
  
  const originalWords = splitWords(originalText);
  const proposedWords = splitWords(proposedText);
  
  const lcs = computeLCS(originalWords, proposedWords);
  return buildDiffFromLCS(originalWords, proposedWords, lcs);
}

/**
 * Deep clone a TipTap node.
 */
function cloneNode(node: TipTapNode): TipTapNode {
  return JSON.parse(JSON.stringify(node));
}

/**
 * Create a text node with diff marks applied.
 */
function createTextNodeWithMark(text: string, markType: 'diffInserted' | 'diffDeleted', existingMarks?: any[]): TipTapNode {
  const marks = [...(existingMarks || []), { type: markType }];
  return {
    type: 'text',
    text,
    marks
  };
}

/**
 * Build merged content from diff segments for a paragraph/text block.
 */
function buildMergedContent(diffSegments: DiffSegment[]): TipTapNode[] {
  const content: TipTapNode[] = [];
  
  // Group consecutive segments of the same type for cleaner output
  let currentType: 'same' | 'added' | 'removed' | null = null;
  let currentText = '';
  
  const flushCurrent = () => {
    if (currentText && currentType) {
      if (currentType === 'same') {
        content.push({ type: 'text', text: currentText });
      } else if (currentType === 'added') {
        content.push(createTextNodeWithMark(currentText, 'diffInserted'));
      } else if (currentType === 'removed') {
        content.push(createTextNodeWithMark(currentText, 'diffDeleted'));
      }
    }
    currentText = '';
    currentType = null;
  };
  
  for (const segment of diffSegments) {
    if (segment.type !== currentType) {
      flushCurrent();
      currentType = segment.type;
    }
    currentText += segment.text;
  }
  
  flushCurrent();
  
  return content;
}

/**
 * Process a single block node (paragraph, heading, etc.) and apply diff.
 */
function processBlockNode(
  originalNode: TipTapNode | null,
  proposedNode: TipTapNode | null
): TipTapNode | null {
  // If only original exists, mark entire content as deleted
  if (originalNode && !proposedNode) {
    const clone = cloneNode(originalNode);
    const text = extractText(clone);
    if (text) {
      clone.content = [createTextNodeWithMark(text, 'diffDeleted')];
    }
    return clone;
  }
  
  // If only proposed exists, mark entire content as inserted
  if (!originalNode && proposedNode) {
    const clone = cloneNode(proposedNode);
    const text = extractText(clone);
    if (text) {
      clone.content = [createTextNodeWithMark(text, 'diffInserted')];
    }
    return clone;
  }
  
  // Both exist - compute diff
  if (originalNode && proposedNode) {
    const originalText = extractText(originalNode);
    const proposedText = extractText(proposedNode);
    
    // Use proposed node structure as base
    const result = cloneNode(proposedNode);
    
    if (originalText === proposedText) {
      // No changes
      return result;
    }
    
    const diffSegments = computeWordDiff(originalText, proposedText);
    result.content = buildMergedContent(diffSegments);
    
    return result;
  }
  
  return null;
}

/**
 * Compute merged diff content between two TipTap documents.
 * Returns a new document with diff marks applied.
 */
export function computeDiffContent(
  originalContent: TipTapNode | null | undefined,
  proposedContent: TipTapNode | null | undefined
): TipTapNode {
  // Default empty document
  const emptyDoc: TipTapNode = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [] }]
  };
  
  if (!originalContent && !proposedContent) {
    return emptyDoc;
  }
  
  const original = originalContent || emptyDoc;
  const proposed = proposedContent || emptyDoc;
  
  const originalBlocks = original.content || [];
  const proposedBlocks = proposed.content || [];
  
  // Use LCS on block level to match blocks
  const maxLen = Math.max(originalBlocks.length, proposedBlocks.length);
  const resultBlocks: TipTapNode[] = [];
  
  // Simple approach: iterate through both arrays using LCS for matching
  const originalTexts = originalBlocks.map(b => extractText(b));
  const proposedTexts = proposedBlocks.map(b => extractText(b));
  
  const lcs = computeLCS(originalTexts, proposedTexts);
  
  let i = originalBlocks.length;
  let j = proposedBlocks.length;
  
  const tempBlocks: TipTapNode[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalTexts[i - 1] === proposedTexts[j - 1]) {
      // Same content - no diff needed
      tempBlocks.unshift(cloneNode(proposedBlocks[j - 1]));
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      // Block added in proposed
      const processed = processBlockNode(null, proposedBlocks[j - 1]);
      if (processed) {
        tempBlocks.unshift(processed);
      }
      j--;
    } else if (i > 0) {
      // Block removed from original
      const processed = processBlockNode(originalBlocks[i - 1], null);
      if (processed) {
        tempBlocks.unshift(processed);
      }
      i--;
    }
  }
  
  // Handle case where blocks exist but content changed within them
  // For a more accurate diff, we also need to handle partial matches
  // For now, use the block-level diff with word-level diff within each block
  
  // If we have exact same number of blocks, do word-level diff within each
  if (originalBlocks.length === proposedBlocks.length && tempBlocks.length === 0) {
    for (let k = 0; k < originalBlocks.length; k++) {
      const processed = processBlockNode(originalBlocks[k], proposedBlocks[k]);
      if (processed) {
        resultBlocks.push(processed);
      }
    }
  } else {
    resultBlocks.push(...tempBlocks);
  }
  
  // If we ended up with same block counts but different content, do block-by-block comparison
  if (resultBlocks.length === 0 && originalBlocks.length === proposedBlocks.length) {
    for (let k = 0; k < originalBlocks.length; k++) {
      const processed = processBlockNode(originalBlocks[k], proposedBlocks[k]);
      if (processed) {
        resultBlocks.push(processed);
      }
    }
  }
  
  // Fallback: if still empty but we have proposed content, use it with diff
  if (resultBlocks.length === 0) {
    if (proposedBlocks.length > 0) {
      for (let k = 0; k < Math.max(originalBlocks.length, proposedBlocks.length); k++) {
        const orig = k < originalBlocks.length ? originalBlocks[k] : null;
        const prop = k < proposedBlocks.length ? proposedBlocks[k] : null;
        const processed = processBlockNode(orig, prop);
        if (processed) {
          resultBlocks.push(processed);
        }
      }
    } else if (originalBlocks.length > 0) {
      for (const block of originalBlocks) {
        const processed = processBlockNode(block, null);
        if (processed) {
          resultBlocks.push(processed);
        }
      }
    }
  }
  
  return {
    type: 'doc',
    content: resultBlocks.length > 0 ? resultBlocks : [{ type: 'paragraph', content: [] }]
  };
}
