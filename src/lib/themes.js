// Placeholder backgrounds ("carátulas"); final designs come later.
export const THEMES = [
  { id: 'midnight', name: 'Medianoche', css: 'linear-gradient(160deg,#0f172a,#1e293b)' },
  { id: 'ocean', name: 'Océano', css: 'linear-gradient(160deg,#0c4a6e,#0e7490)' },
  { id: 'sunset', name: 'Atardecer', css: 'linear-gradient(160deg,#7c2d12,#be185d)' },
  { id: 'forest', name: 'Bosque', css: 'linear-gradient(160deg,#14532d,#065f46)' },
  { id: 'lavender', name: 'Lavanda', css: 'linear-gradient(160deg,#4c1d95,#7e22ce)' },
  { id: 'rose', name: 'Rosa', css: 'linear-gradient(160deg,#9d174d,#f472b6)' },
  { id: 'gold', name: 'Oro', css: 'linear-gradient(160deg,#713f12,#ca8a04)' },
  { id: 'aurora', name: 'Aurora', css: 'linear-gradient(160deg,#064e3b,#1d4ed8,#7c3aed)' },
  { id: 'graphite', name: 'Grafito', css: 'linear-gradient(160deg,#18181b,#52525b)' },
  { id: 'peach', name: 'Durazno', css: 'linear-gradient(160deg,#9a3412,#fb923c)' },
]

export const themeCss = (id) => (THEMES.find((t) => t.id === id) || THEMES[0]).css
