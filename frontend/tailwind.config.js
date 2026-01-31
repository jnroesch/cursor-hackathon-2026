/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Scharf Design System - Brand Colors
        brand: {
          canvas: '#F4F4F4',    // Main article background (light grey)
          panel: '#0D0D0D',     // Dark sidebar (deep black)
          border: '#D1D1D1',    // Hairline dividers
          accent: '#E5E5E5',    // Hover states
          white: '#FFFFFF',    // Pure white backgrounds
          code: '#1E1E1E',     // Code block background
        },
        // Scharf Design System - Text Colors
        text: {
          primary: '#1A1A1A',   // High legibility near-black for body copy
          muted: '#666666',     // Greyed out metadata (dates, author)
          body: '#222222',      // Standard body text color
          inverse: '#FFFFFF',   // White text for dark backgrounds
        }
      },
      fontFamily: {
        // Scharf Design System - Typography
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Scharf Design System - Font Sizes
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h2': ['2rem', { lineHeight: '1.2' }],
        'h3': ['1.5rem', { lineHeight: '1.3' }],
        'article-body': ['1.125rem', { lineHeight: '1.6' }],
        'subheading': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      borderWidth: {
        'hairline': '0.5px',
        '1': '1px',
      },
      spacing: {
        'rail': '60px',  // Left navigation rail width
      },
      borderRadius: {
        'none': '0px',   // Scharf - sharp corners, no radius
      }
    }
  },
  plugins: [],
}
