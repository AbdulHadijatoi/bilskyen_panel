import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const API_BASE = '/api/v1/admin/translations'

export interface TranslationKey {
  id: number
  key: string
  default_value: string
  values?: TranslationValue[]
}

export interface TranslationValue {
  id: number
  translation_key_id: number
  locale: string
  value: string
}

export interface CreateTranslationRequest {
  key: string
  default_value: string
  translations?: Array<{
    locale: string
    value: string
  }>
}

export interface UpdateTranslationRequest {
  key?: string
  default_value?: string
}

export interface ImportResult {
  created: number
  updated: number
  errors: string[]
}

class TranslationService {
  private getAuthHeaders() {
    const authStore = useAuthStore()
    return {
      Authorization: `Bearer ${authStore.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  async getTranslations(params?: {
    search?: string
    limit?: number
    page?: number
  }): Promise<{
    success: boolean
    data: {
      docs: TranslationKey[]
      limit: number
      page: number
      totalDocs?: number
      totalPages?: number
    }
  }> {
    const response = await axios.get(API_BASE, {
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      params: {
        ...params,
        _t: Date.now(), // Cache busting parameter
      },
    })
    return response.data
  }

  async getTranslation(id: number): Promise<{
    success: boolean
    data: TranslationKey
  }> {
    const response = await axios.get(`${API_BASE}/${id}`, {
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      params: {
        _t: Date.now(), // Cache busting parameter
      },
    })
    return response.data
  }

  async createTranslation(data: CreateTranslationRequest): Promise<{
    success: boolean
    data: TranslationKey
  }> {
    const response = await axios.post(API_BASE, data, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateTranslation(
    id: number,
    data: UpdateTranslationRequest
  ): Promise<{
    success: boolean
    data: TranslationKey
  }> {
    const response = await axios.put(`${API_BASE}/${id}`, data, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateTranslationValue(
    id: number,
    locale: string,
    value: string
  ): Promise<{
    success: boolean
    data: TranslationKey
  }> {
    const response = await axios.put(
      `${API_BASE}/${id}/values/${locale}`,
      { value },
      {
        headers: this.getAuthHeaders(),
      }
    )
    return response.data
  }

  async deleteTranslation(id: number): Promise<{
    success: boolean
  }> {
    const response = await axios.delete(`${API_BASE}/${id}`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async importTranslations(file: File): Promise<{
    success: boolean
    data: ImportResult
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(`${API_BASE}/import`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async exportTranslations(): Promise<{
    success: boolean
    data: Array<{
      key: string
      default_value: string
      en: string
      da: string
    }>
  }> {
    const response = await axios.get(`${API_BASE}/export`, {
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      params: {
        _t: Date.now(), // Cache busting parameter
      },
    })
    return response.data
  }

  async getLocales(): Promise<{
    success: boolean
    data: string[]
  }> {
    const response = await axios.get(`${API_BASE}/locales`, {
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      params: {
        _t: Date.now(), // Cache busting parameter
      },
    })
    return response.data
  }

  // Batch loading for performance
  async loadBatch(keys: string[], locale?: string): Promise<Record<string, string>> {
    // This could be optimized with a batch endpoint, but for now we'll use export
    const result = await this.exportTranslations()
    const translations: Record<string, string> = {}

    if (result.success && result.data) {
      result.data.forEach((item) => {
        if (keys.includes(item.key)) {
          const value = locale
            ? item[locale as keyof typeof item] || item.default_value
            : item.default_value
          translations[item.key] = value || item.key
        }
      })
    }

    return translations
  }
}

export const translationService = new TranslationService()
