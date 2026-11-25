/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/*.js'],
  safelist: [
    'hidden', 'daa-card', 'daa-button-primary', 'sr-only',
    'flex', 'flex-1', 'flex-col', 'flex-wrap', 'items-center', 'items-start',
    'justify-center', 'justify-end', 'gap-2', 'gap-3', 'gap-4',
    'mt-1', 'mt-3', 'mt-4', 'mt-5', 'mt-6',
    'p-6', 'px-4', 'py-3',
    'rounded-xl', 'rounded-full', 'object-cover', 'h-12', 'w-12',
    'text-sm', 'text-xs', 'text-xl', 'text-3xl', 'font-bold', 'font-extrabold', 'font-black',
    'text-night', 'text-primary', 'text-slate-500', 'text-slate-600', 'text-slate-700',
    'bg-night', 'text-white', 'hover:text-amber-300', 'text-emerald-300', 'hover:text-white',
    'mx-auto', 'max-w-7xl', 'px-5', 'py-4', 'py-8', 'sm:px-8', 'sm:flex-row', 'sm:items-center', 'sm:justify-between'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        primarydark: '#047857',
        night: '#0F172A',
        gold: '#D97706',
        mist: '#F8FAFC',
        navy: '#0F172A',
        emerald: { DEFAULT: '#059669', dark: '#047857' },
        'gold-deep': '#D97706'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
