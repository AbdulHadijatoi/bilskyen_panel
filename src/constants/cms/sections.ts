export interface CmsSectionVariantDef {
  id: string
  label: string
  description: string
}

export interface CmsSectionTypeDef {
  type: string
  label: string
  description: string
  scope: 'landing' | 'blog' | 'both'
  variants: CmsSectionVariantDef[]
  defaultContent: Record<string, unknown>
}

export const LANDING_SECTION_TYPES: CmsSectionTypeDef[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Primary headline and call to action',
    scope: 'landing',
    variants: [
      { id: 'centered-dark', label: 'Centered dark', description: 'Dark band, centered copy' },
      { id: 'split-image', label: 'Split image', description: 'Copy left, image right' },
      { id: 'minimal-light', label: 'Minimal light', description: 'Clean light header' },
      { id: 'full-bleed', label: 'Full bleed', description: 'Large image backdrop' },
    ],
    defaultContent: {
      headline: '',
      subheadline: '',
      cta_text: '',
      cta_url: '',
      image_url: '',
    },
  },
  {
    type: 'richtext',
    label: 'Rich text',
    description: 'Formatted article or guide body',
    scope: 'landing',
    variants: [
      { id: 'narrow-prose', label: 'Narrow prose', description: 'Readable reading width' },
      { id: 'wide', label: 'Wide', description: 'Full content width' },
      { id: 'two-column', label: 'Two column', description: 'Side-by-side text columns' },
    ],
    defaultContent: { html: '', html_secondary: '' },
  },
  {
    type: 'cta',
    label: 'Call to action',
    description: 'Conversion band with button',
    scope: 'landing',
    variants: [
      { id: 'banner-brand', label: 'Brand banner', description: 'Primary blue band' },
      { id: 'dark', label: 'Dark', description: 'High-contrast dark band' },
      { id: 'soft-band', label: 'Soft band', description: 'Subtle light background' },
    ],
    defaultContent: { title: '', subtitle: '', button_text: '', button_url: '' },
  },
  {
    type: 'vehicle_grid',
    label: 'Vehicle grid',
    description: 'Latest published vehicles',
    scope: 'landing',
    variants: [
      { id: 'cards-3', label: '3-column cards', description: 'Standard inventory grid' },
      { id: 'featured-row', label: 'Featured row', description: 'Horizontal spotlight cards' },
    ],
    defaultContent: { title: '', limit: 6 },
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Questions and answers',
    scope: 'landing',
    variants: [
      { id: 'accordion', label: 'Accordion', description: 'Expandable details' },
      { id: 'two-column', label: 'Two column', description: 'Side-by-side Q&A' },
    ],
    defaultContent: { title: '', items: [{ question: '', answer: '' }] },
  },
  {
    type: 'features',
    label: 'Features',
    description: 'Benefit highlights',
    scope: 'landing',
    variants: [
      { id: 'icon-grid', label: 'Icon grid', description: '3-up feature cards' },
      { id: 'checklist', label: 'Checklist', description: 'Vertical check list' },
    ],
    defaultContent: {
      title: '',
      subtitle: '',
      items: [
        { title: '', body: '', icon: 'check' },
        { title: '', body: '', icon: 'check' },
        { title: '', body: '', icon: 'check' },
      ],
    },
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Social proof quotes',
    scope: 'landing',
    variants: [{ id: 'quote-cards', label: 'Quote cards', description: 'Card grid of quotes' }],
    defaultContent: { title: '', items: [{ quote: '', author: '', role: '' }] },
  },
  {
    type: 'stats',
    label: 'Stats',
    description: 'Key metrics row',
    scope: 'landing',
    variants: [{ id: 'metric-row', label: 'Metric row', description: 'Centered value + label' }],
    defaultContent: {
      title: '',
      items: [
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ],
    },
  },
  {
    type: 'image_text',
    label: 'Image + text',
    description: 'Split media and copy',
    scope: 'landing',
    variants: [
      { id: 'image-left', label: 'Image left', description: 'Media on the left' },
      { id: 'image-right', label: 'Image right', description: 'Media on the right' },
    ],
    defaultContent: { title: '', body: '', image_url: '', cta_text: '', cta_url: '' },
  },
]

export const BLOG_SECTION_TYPES: CmsSectionTypeDef[] = [
  {
    type: 'pull_quote',
    label: 'Pull quote',
    description: 'Highlighted quote in the article flow',
    scope: 'blog',
    variants: [
      { id: 'accent-left', label: 'Accent left', description: 'Border accent quote' },
      { id: 'centered', label: 'Centered', description: 'Centered large quote' },
    ],
    defaultContent: { quote: '', attribution: '' },
  },
  {
    type: 'cta_inline',
    label: 'Inline CTA',
    description: 'In-article call to action',
    scope: 'blog',
    variants: [
      { id: 'soft-band', label: 'Soft band', description: 'Subtle band' },
      { id: 'brand-banner', label: 'Brand banner', description: 'Primary banner' },
    ],
    defaultContent: { title: '', button_text: '', button_url: '' },
  },
  {
    type: 'related_posts',
    label: 'Related posts',
    description: 'Links to other articles',
    scope: 'blog',
    variants: [{ id: 'card-row', label: 'Card row', description: 'Horizontal related cards' }],
    defaultContent: { title: 'Related articles', limit: 3 },
  },
  {
    type: 'toc',
    label: 'Table of contents',
    description: 'Auto headings from the article body',
    scope: 'blog',
    variants: [{ id: 'sidebar-list', label: 'Sidebar list', description: 'Linked heading list' }],
    defaultContent: { title: 'In this article' },
  },
  {
    type: 'author_box',
    label: 'Author box',
    description: 'Author credit card',
    scope: 'blog',
    variants: [{ id: 'simple-card', label: 'Simple card', description: 'Name and optional bio' }],
    defaultContent: { show_bio: true },
  },
]

export function getLandingSectionType(type: string): CmsSectionTypeDef | undefined {
  return LANDING_SECTION_TYPES.find((s) => s.type === type)
}

export function getBlogSectionType(type: string): CmsSectionTypeDef | undefined {
  return BLOG_SECTION_TYPES.find((s) => s.type === type)
}

export function defaultVariant(type: string, blog = false): string {
  const list = blog ? BLOG_SECTION_TYPES : LANDING_SECTION_TYPES
  const def = list.find((s) => s.type === type)
  return def?.variants[0]?.id ?? 'default'
}

export function createSectionBlock(
  type: string,
  variant?: string,
  blog = false,
): { id: string; type: string; variant: string; content: Record<string, unknown> } {
  const list = blog ? BLOG_SECTION_TYPES : LANDING_SECTION_TYPES
  const def = list.find((s) => s.type === type)
  return {
    id: crypto.randomUUID(),
    type,
    variant: variant ?? def?.variants[0]?.id ?? 'default',
    content: { ...(def?.defaultContent ?? {}) },
  }
}

export function seedBlocksFromLayout(seed: { type: string; variant: string }[], blog = false) {
  return seed.map((s) => createSectionBlock(s.type, s.variant, blog))
}
