export type LandingLayoutId = 'funnel' | 'guide' | 'spotlight' | 'minimal' | 'conversion'
export type BlogLayoutId = 'classic' | 'hero' | 'magazine' | 'feature'

export interface CmsLayoutSeed {
  type: string
  variant: string
}

export interface CmsLayoutDef {
  id: string
  label: string
  description: string
  seed: CmsLayoutSeed[]
}

export const LANDING_LAYOUTS: CmsLayoutDef[] = [
  {
    id: 'funnel',
    label: 'Funnel',
    description: 'Hero, benefits, vehicles, FAQ, and a closing CTA',
    seed: [
      { type: 'hero', variant: 'centered-dark' },
      { type: 'features', variant: 'icon-grid' },
      { type: 'vehicle_grid', variant: 'cards-3' },
      { type: 'faq', variant: 'accordion' },
      { type: 'cta', variant: 'banner-brand' },
    ],
  },
  {
    id: 'guide',
    label: 'Guide',
    description: 'Educational page with prose, FAQ, and soft CTA',
    seed: [
      { type: 'hero', variant: 'minimal-light' },
      { type: 'richtext', variant: 'narrow-prose' },
      { type: 'faq', variant: 'accordion' },
      { type: 'cta', variant: 'soft-band' },
    ],
  },
  {
    id: 'spotlight',
    label: 'Vehicle spotlight',
    description: 'Full-bleed hero focused on inventory',
    seed: [
      { type: 'hero', variant: 'full-bleed' },
      { type: 'vehicle_grid', variant: 'featured-row' },
      { type: 'cta', variant: 'dark' },
    ],
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Simple hero and rich text — light and fast',
    seed: [
      { type: 'hero', variant: 'minimal-light' },
      { type: 'richtext', variant: 'narrow-prose' },
    ],
  },
  {
    id: 'conversion',
    label: 'Conversion',
    description: 'Split hero, proof, testimonials, CTA, FAQ',
    seed: [
      { type: 'hero', variant: 'split-image' },
      { type: 'features', variant: 'checklist' },
      { type: 'testimonials', variant: 'quote-cards' },
      { type: 'cta', variant: 'banner-brand' },
      { type: 'faq', variant: 'two-column' },
    ],
  },
]

export const BLOG_LAYOUTS: CmsLayoutDef[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Centered header, featured image, and prose',
    seed: [],
  },
  {
    id: 'hero',
    label: 'Hero image',
    description: 'Full-bleed cover with title overlaid',
    seed: [],
  },
  {
    id: 'magazine',
    label: 'Magazine',
    description: 'Wider article with room for a table of contents',
    seed: [{ type: 'toc', variant: 'sidebar-list' }],
  },
  {
    id: 'feature',
    label: 'Feature',
    description: 'Large title with pull-quote and author chrome',
    seed: [
      { type: 'pull_quote', variant: 'accent-left' },
      { type: 'author_box', variant: 'simple-card' },
    ],
  },
]

export function getLandingLayout(id: string): CmsLayoutDef {
  return LANDING_LAYOUTS.find((l) => l.id === id) ?? LANDING_LAYOUTS[1]
}

export function getBlogLayout(id: string): CmsLayoutDef {
  return BLOG_LAYOUTS.find((l) => l.id === id) ?? BLOG_LAYOUTS[0]
}
