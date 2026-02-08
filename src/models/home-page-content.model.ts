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
