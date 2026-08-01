export type CmsStyleId = 'brand' | 'editorial' | 'bold' | 'soft'

export interface CmsStyleDef {
  id: CmsStyleId
  label: string
  description: string
  preview: {
    bg: string
    accent: string
    text: string
    muted: string
  }
}

export const CMS_STYLES: CmsStyleDef[] = [
  {
    id: 'brand',
    label: 'Brand',
    description: 'Bilskyen primary blue — default marketplace look',
    preview: { bg: '#f5f7fb', accent: '#03418b', text: '#0f172a', muted: '#64748b' },
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Refined muted tones for long-form guides',
    preview: { bg: '#f7f6f3', accent: '#1e3a5f', text: '#1c1917', muted: '#78716c' },
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'High-contrast dark accents for campaigns',
    preview: { bg: '#0f172a', accent: '#3b82f6', text: '#f8fafc', muted: '#94a3b8' },
  },
  {
    id: 'soft',
    label: 'Soft',
    description: 'Light backgrounds and gentle bands',
    preview: { bg: '#f8fafc', accent: '#2563eb', text: '#334155', muted: '#94a3b8' },
  },
]

export function getStyle(id: string): CmsStyleDef {
  return CMS_STYLES.find((s) => s.id === id) ?? CMS_STYLES[0]
}
