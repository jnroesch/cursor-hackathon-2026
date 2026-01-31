/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: '#F4F4F4',    // Main article background
          panel: '#0D0D0D',     // Dark sidebar
          border: '#D1D1D1',    // Hairline dividers
          accent: '#E5E5E5',    // Hover states
        },
        text: {
          primary: '#1A1A1A',   // High legibility near-black for body copy
          muted: '#666666',     // Greyed out metadata (dates, author)
          body: '#222222',      // Body text color
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'article-body': ['1.125rem', { lineHeight: '1.6' }],
        'subheading': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      borderWidth: {
        'hairline': '0.5px',
      },
      spacing: {
        'rail': '60px',  // Left navigation rail width
      }
    }
  },
  plugins: [],
}
