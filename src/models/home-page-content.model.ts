/**
 * Home Page Content Model
 * 
 * Maps backend home page content response to TypeScript interface
 * Converts snake_case to camelCase
 */

/**
 * Home page section model interface
 */
export interface HomePageSectionModel {
  id: number
  sectionKey: string
  content: string | null
  pageName: string
  createdAt: string
  updatedAt: string
}

/**
 * Map API response (snake_case) to HomePageSectionModel (camelCase)
 */
export function mapHomePageSectionFromApi(data: any): HomePageSectionModel {
  return {
    id: data.id,
    sectionKey: data.section_key,
    content: data.content,
    pageName: data.page_name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Map array of API responses to HomePageSectionModel array
 */
export function mapHomePageSectionsFromApi(data: any[]): HomePageSectionModel[] {
  if (!Array.isArray(data)) {
    console.error('mapHomePageSectionsFromApi: data is not an array', data)
    return []
  }
  return data.map(mapHomePageSectionFromApi)
}

/**
 * Home page content map (section_key => content)
 */
export interface HomePageContentMap {
  [sectionKey: string]: string | null
}

/**
 * Page image model interface
 */
export interface PageImageModel {
  id: number
  pageName: string
  sectionKey: string
  imagePath: string
  imageUrl: string
  altText: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Map API response (snake_case) to PageImageModel (camelCase)
 */
export function mapPageImageFromApi(data: any): PageImageModel {
  return {
    id: data.id,
    pageName: data.page_name,
    sectionKey: data.section_key,
    imagePath: data.image_path,
    imageUrl: data.image_url,
    altText: data.alt_text,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Map array of API responses to PageImageModel array
 */
export function mapPageImagesFromApi(data: any[]): PageImageModel[] {
  if (!Array.isArray(data)) {
    console.error('mapPageImagesFromApi: data is not an array', data)
    return []
  }
  return data.map(mapPageImageFromApi)
}

/**
 * Page images map (section_key => PageImageModel[])
 */
export interface PageImagesMap {
  [sectionKey: string]: PageImageModel[]
}

/**
 * About page content map (section_key => content)
 */
export interface AboutPageContentMap {
  [sectionKey: string]: string | null
}

/**
 * Contact page content map (section_key => content)
 */
export interface ContactPageContentMap {
  [sectionKey: string]: string | null
}
