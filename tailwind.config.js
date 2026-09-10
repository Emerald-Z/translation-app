/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2F3F75',          // primary navy — sidebar, headings, body text
        'ink-soft': '#63678E',   // muted navy for secondary copy
        peri: '#6A7CB9',         // periwinkle — buttons, active nav, sliders
        'peri-soft': '#CBD1E3',  // pale periwinkle — chips, tracks, secondary buttons
        'peri-faint': '#B6BDD3', // stat tile blue
        cream: '#F4F2E7',        // page background
        sand: '#DDD8C4',         // panels, tiles, shelf area
        'sand-soft': '#E2DFCD',  // auth card
        line: '#E9E8DD',         // hairline borders
        wood: '#806349',         // bookshelf
        canvas: '#DDDCD0',       // reader backdrop
        toolbar: '#C6C1A5',      // reader floating toolbar
        olive: '#625615',        // gold/olive accent text
        rose: '#D1ACAC',         // stat tile pink
        heart: '#CC2B2B',        // favourite heart
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 6px rgba(47, 63, 117, 0.10)',
        panel: '0 4px 18px rgba(47, 63, 117, 0.14)',
        raise: '4px 4px 0 rgba(47, 63, 117, 0.18)',
      },
      borderRadius: { xs: '3px' },
    },
  },
  plugins: [],
}
