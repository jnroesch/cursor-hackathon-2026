import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * TipTap mark extension for highlighting inserted text in diff view.
 * Renders with green background.
 */
export const DiffInserted = Mark.create({
  name: 'diffInserted',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'diff-inserted',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.diff-inserted',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

/**
 * TipTap mark extension for highlighting deleted text in diff view.
 * Renders with red background and strikethrough.
 */
export const DiffDeleted = Mark.create({
  name: 'diffDeleted',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'diff-deleted',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.diff-deleted',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
