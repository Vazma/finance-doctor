// Placeholder backgrounds ("carátulas"); final designs come later.
export const THEMES = [
  { id: 'midnight', name: 'Medianoche', css: 'linear-gradient(160deg,#0f172a,#1e2738)' },
  { id: 'ocean', name: 'Océano', css: 'linear-gradient(160deg,#10222e,#1f3d4a)' },
  { id: 'sunset', name: 'Atardecer', css: 'linear-gradient(160deg,#2a1a1f,#4a2b33)' },
  { id: 'forest', name: 'Bosque', css: 'linear-gradient(160deg,#121f1a,#24382f)' },
  { id: 'lavender', name: 'Lavanda', css: 'linear-gradient(160deg,#1c1a2e,#353048)' },
  { id: 'rose', name: 'Rosa', css: 'linear-gradient(160deg,#2b1a22,#4d3040)' },
  { id: 'gold', name: 'Arena', css: 'linear-gradient(160deg,#25211a,#423a2c)' },
  { id: 'olive', name: 'Olivo', css: 'linear-gradient(160deg,#1c1f16,#363b2a)' },
  { id: 'graphite', name: 'Grafito', css: 'linear-gradient(160deg,#18181b,#303036)' },
  { id: 'peach', name: 'Terracota', css: 'linear-gradient(160deg,#2a1d18,#4a3128)' },
]

export const themeCss = (id) => (THEMES.find((t) => t.id === id) || THEMES[0]).css
