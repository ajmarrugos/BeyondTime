// --- Theme Configuration ---

export const themes = {
  dark: {
    type: 'dark',
    background: 'bg-zinc-950',
    engravedBg: 'bg-black/30',
    blobColors: ['bg-gray-500', 'bg-slate-600', 'bg-zinc-700', 'bg-neutral-800', 'bg-gray-400'],
    cardBg: 'bg-black/20',
    textColor: 'text-gray-200',
    subtextColor: 'text-gray-400',
  },
  leaf: {
    type: 'dark',
    background: 'bg-emerald-950',
    engravedBg: 'bg-black/30',
    blobColors: ['bg-green-500', 'bg-lime-400', 'bg-teal-500', 'bg-emerald-600', 'bg-yellow-400'],
    cardBg: 'bg-black/20',
    textColor: 'text-gray-200',
    subtextColor: 'text-gray-400',
  },
  sea: {
    type: 'dark',
    background: 'bg-teal-950',
    engravedBg: 'bg-black/30',
    blobColors: ['bg-cyan-400', 'bg-emerald-500', 'bg-teal-400', 'bg-green-600', 'bg-sky-500'],
    cardBg: 'bg-black/20',
    textColor: 'text-gray-200',
    subtextColor: 'text-gray-400',
  },
  moon: {
    type: 'dark',
    background: 'bg-slate-950',
    engravedBg: 'bg-black/30',
    blobColors: ['bg-indigo-700', 'bg-slate-800', 'bg-purple-800', 'bg-gray-700', 'bg-blue-900'],
    cardBg: 'bg-black/20',
    textColor: 'text-gray-200',
    subtextColor: 'text-gray-400',
  },
  light: {
    type: 'light',
    background: 'bg-gray-50',
    engravedBg: 'bg-gray-100',
    blobColors: [
        'bg-sky-300', 
        'bg-blue-200', 
        'bg-indigo-200', 
        'bg-rose-100', 
        'bg-amber-100',
        'bg-cyan-200',
        'bg-fuchsia-200'
    ],
    cardBg: 'bg-white/60',
    textColor: 'text-gray-900',
    subtextColor: 'text-gray-600',
  },
  garden: {
    type: 'light',
    background: 'bg-fuchsia-50',
    engravedBg: 'bg-fuchsia-100',
    blobColors: ['bg-purple-300', 'bg-fuchsia-300', 'bg-violet-200', 'bg-pink-200', 'bg-rose-200'],
    cardBg: 'bg-white/60',
    textColor: 'text-gray-900',
    subtextColor: 'text-gray-600',
  },
  beach: {
    type: 'light',
    background: 'bg-cyan-50',
    engravedBg: 'bg-cyan-100',
    blobColors: ['bg-sky-300', 'bg-cyan-200', 'bg-teal-200', 'bg-amber-200', 'bg-yellow-100'],
    cardBg: 'bg-white/60',
    textColor: 'text-gray-900',
    subtextColor: 'text-gray-600',
  },
  sun: {
    type: 'light',
    background: 'bg-amber-50',
    engravedBg: 'bg-amber-100',
    blobColors: ['bg-yellow-300', 'bg-amber-300', 'bg-orange-300', 'bg-red-200', 'bg-yellow-200'],
    cardBg: 'bg-white/60',
    textColor: 'text-gray-900',
    subtextColor: 'text-gray-600',
  },
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName];

export const lightThemeOptions: { name: ThemeName, label: string }[] = [
  { name: 'light', label: 'Light' },
  { name: 'garden', label: 'Garden' },
  { name: 'beach', label: 'Beach' },
  { name: 'sun', label: 'Sun' },
];

export const darkThemeOptions: { name: ThemeName, label: string }[] = [
  { name: 'dark', label: 'Dark' },
  { name: 'leaf', label: 'Leaf' },
  { name: 'sea', label: 'Sea' },
  { name: 'moon', label: 'Moon' },
];