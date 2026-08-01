export type { CmsStyleId, CmsStyleDef } from './styles'
export { CMS_STYLES, getStyle } from './styles'
export type { LandingLayoutId, BlogLayoutId, CmsLayoutDef, CmsLayoutSeed } from './layouts'
export { LANDING_LAYOUTS, BLOG_LAYOUTS, getLandingLayout, getBlogLayout } from './layouts'
export type { CmsSectionTypeDef, CmsSectionVariantDef } from './sections'
export {
  LANDING_SECTION_TYPES,
  BLOG_SECTION_TYPES,
  getLandingSectionType,
  getBlogSectionType,
  defaultVariant,
  createSectionBlock,
  seedBlocksFromLayout,
} from './sections'

export interface CmsBlock {
  id: string
  type: string
  variant: string
  content: Record<string, unknown>
}
