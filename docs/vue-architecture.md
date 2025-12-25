<!--
Vue Architecture Checksum: e8555271e7d77f561e192dd0137396c5f109e12afbd8780169a8c42575b84240
Source: panel_vue/docs/vue-architecture.md
Algorithm: SHA-256

IMPORTANT: If this checksum changes, the Vue architecture has been modified.
Re-evaluate the entire Vue API architecture and update this documentation accordingly.
Treat this architecture as immutable unless the checksum changes.
-->

# Vue 3 API Architecture Documentation

## Overview

This document describes the Vue 3 (Composition API + TypeScript) API integration architecture for the panel application. The architecture strictly follows the backend API architecture (v1, JWT, roles, standardized responses) and enforces centralized API calls, standardized response handling, TypeScript models, and proper separation of concerns.

## Table of Contents

- [Project Structure](#project-structure)
- [Architecture Principles](#architecture-principles)
- [Configuration](#configuration)
- [Models](#models)
- [API Modules](#api-modules)
- [HTTP Client](#http-client)
- [Response Handling](#response-handling)
- [Token Management](#token-management)
- [User Management](#user-management)
- [Permissions & Roles](#permissions--roles)
- [State Management](#state-management)
- [Router Integration](#router-integration)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Project Structure

```
src/
 ├── api/
 │   ├── http.ts                // Axios instance + interceptors
 │   ├── endpoints.ts           // Centralized API route definitions
 │   ├── response.ts            // Centralized response & error handler
 │   ├── auth.api.ts            // Auth-related API calls
 │   ├── dealer.api.ts          // Dealer APIs
 │   ├── admin.api.ts           // Admin APIs
 │   ├── public.api.ts          // Public APIs
 │   └── nummerplade.api.ts     // Nummerplade proxy APIs
 │
 ├── models/
 │   ├── user.model.ts
 │   ├── vehicle.model.ts
 │   ├── dealer.model.ts
 │   ├── lead.model.ts
 │   ├── pagination.model.ts
 │   └── api-error.model.ts
 │
 ├── stores/
 │   └── auth.store.ts          // Pinia auth store (token + user)
 │
 ├── utils/
 │   ├── token.ts               // Token storage & access helpers
 │   ├── user.ts                // Centralized user extractor
 │   └── permissions.ts        // Role/permission helpers
 │
 └── config/
     └── api.ts                 // Base URL, version, env config
```

## Architecture Principles

### Core Rules

1. **No Axios in Components** - All API calls must go through `api/*` modules
2. **No Hardcoded URLs** - Use `endpoints.ts` constants
3. **No Token Access Outside Interceptor** - Use `utils/token.ts`
4. **No Raw API Responses in UI** - Always use mapped models
5. **All Errors Go Through Centralized Handler** - Use `api/response.ts`
6. **All Lists Support Pagination** - Use `PaginationModel<T>`
7. **All POST Create Endpoints Support Idempotency** - Include `Idempotency-Key` header
8. **Frontend Roles Mirror Backend Roles Exactly** - Use `utils/permissions.ts`

### Data Flow

```
Vue Component
    ↓
API Module (auth.api.ts, dealer.api.ts, etc.)
    ↓
HTTP Client (api/http.ts)
    ↓
Request Interceptor (adds Bearer token)
    ↓
Backend API
    ↓
Response Interceptor (handles 401, refresh token)
    ↓
Response Handler (api/response.ts)
    ↓
Model Mapping (snake_case → camelCase)
    ↓
Component receives clean data
```

## Configuration

### API Configuration (`config/api.ts`)

The API configuration centralizes base URL, version, and timeout settings.

```typescript
import { API_CONFIG, apiUrl } from '@/config/api'

// API_CONFIG.baseUrl - Base URL for all requests
// API_CONFIG.version - API version (v1)
// API_CONFIG.timeout - Request timeout (30000ms)
// apiUrl(path) - Helper to construct full API URL
```

**Environment Variables:**
- `VITE_API_BASE_URL` - Base URL (defaults to `/api/v1`)

**Example:**
```typescript
// .env
VITE_API_BASE_URL=https://api.example.com/api/v1
```

## Models

All API entities have TypeScript models that mirror backend API contracts.

### User Model (`models/user.model.ts`)

```typescript
interface UserModel {
  id: number
  name: string
  email: string
  phone?: string
  emailVerified: boolean
  roles?: string[]
  status?: UserStatus
  // ... more fields
}

enum UserRole {
  ADMIN = 'admin',
  DEALER = 'dealer',
  SELLER = 'seller',
}
```

### Vehicle Model (`models/vehicle.model.ts`)

```typescript
interface VehicleModel {
  id: number
  registration?: string
  vin?: string
  price: number
  status?: VehicleStatus
  // ... more fields
}

enum VehicleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD = 'sold',
  ARCHIVED = 'archived',
}
```

### Pagination Model (`models/pagination.model.ts`)

```typescript
interface PaginationModel<T> {
  docs: T[]
  limit: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
  totalDocs?: number
  totalPages?: number
}
```

### Error Models (`models/api-error.model.ts`)

```typescript
interface ApiErrorModel {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
  error_code?: string
}

interface NummerpladeErrorModel extends ApiErrorModel {
  source: 'nummerplade'
  retryable: boolean
  code: NummerpladeErrorCode
}
```

**Key Features:**
- All models convert snake_case API responses to camelCase
- Enums match backend constants exactly
- Models include mapping functions: `mapUserFromApi()`, `mapVehicleFromApi()`, etc.

## API Modules

API modules are organized by feature domain. Each module:
- Uses `endpoints.ts` for route constants
- Uses `http.ts` for requests
- Uses `response.ts` for error handling
- Returns mapped models (never raw API responses)

### Auth API (`api/auth.api.ts`)

```typescript
import { login, register, logout, getCurrentUser, checkAuth } from '@/api/auth.api'

// Login
const user = await login({ email: 'user@example.com', password: 'password' })

// Register
const newUser = await register({ name: 'John', email: 'john@example.com', password: 'password' })

// Get current user
const currentUser = await getCurrentUser()

// Check authentication
const isAuthenticated = await checkAuth()
```

### Dealer API (`api/dealer.api.ts`)

```typescript
import { 
  getVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  getLeads,
  assignLead,
  getProfile,
  updateProfile
} from '@/api/dealer.api'

// Get vehicles with pagination
const vehicles = await getVehicles({ 
  page: 1, 
  limit: 15,
  status: VehicleStatus.PUBLISHED 
})

// Create vehicle (with idempotency)
const vehicle = await createVehicle({
  registration: 'AB12345',
  price: 100000,
  // ... more fields
}, 'unique-idempotency-key')

// Get leads
const leads = await getLeads({ page: 1, limit: 15 })
```

### Admin API (`api/admin.api.ts`)

```typescript
import { 
  getUsers, 
  createUser, 
  banUser, 
  getDealers,
  getPlans,
  getAuditLogs
} from '@/api/admin.api'

// Get all users
const users = await getUsers({ page: 1, limit: 15 })

// Ban user
await banUser(userId)

// Get audit logs
const logs = await getAuditLogs({ user_id: 1, date_from: '2024-01-01' })
```

### Public API (`api/public.api.ts`)

```typescript
import { getVehicles, getLocations, getFuelTypes } from '@/api/public.api'

// Get published vehicles (public)
const vehicles = await getVehicles({ page: 1, limit: 15 })

// Get locations
const locations = await getLocations()

// Get fuel types
const fuelTypes = await getFuelTypes()
```

### Nummerplade API (`api/nummerplade.api.ts`)

```typescript
import { 
  getVehicleByRegistration, 
  getVehicleByVin,
  getInspections,
  getDmrData
} from '@/api/nummerplade.api'

// Get vehicle by registration
const vehicleData = await getVehicleByRegistration({ registration: 'AB12345' })

// Get inspections
const inspections = await getInspections(vehicleId)
```

## HTTP Client

### Axios Instance (`api/http.ts`)

The HTTP client is a single Axios instance with:
- Base URL from `config/api.ts`
- Content-Type: `application/json`
- Automatic token attachment via request interceptor
- Automatic token refresh via response interceptor
- Centralized error handling

**Request Interceptor:**
- Automatically attaches `Authorization: Bearer {accessToken}` header
- Token retrieved from auth store via `utils/token.ts`

**Response Interceptor:**
- Handles 401 errors → attempts token refresh → retries original request
- Queues failed requests during token refresh
- Redirects to login on refresh failure

**Usage:**
```typescript
import httpClient from '@/api/http'

// Never use directly in components!
// Always use API modules instead
```

## Response Handling

### Centralized Handler (`api/response.ts`)

All API responses go through centralized handlers:

**Success Handler:**
```typescript
handleSuccess<T>(response): T
```
- Extracts data from `{ data: {...} }` wrapper
- Returns clean data

**Error Handler:**
```typescript
handleError(error): ApiErrorModel
```
- Maps Axios errors to `ApiErrorModel`
- Handles specific status codes:
  - `401` → logout user, redirect to login
  - `403` → permission error
  - `422` → validation errors
  - `429` → rate limit error
  - `5xx` → system error
- Handles Nummerplade errors with normalized format

**Example:**
```typescript
try {
  const vehicle = await getVehicle(1)
  // vehicle is VehicleModel (mapped, camelCase)
} catch (error) {
  // error is ApiErrorModel (normalized)
  if (error.status === 'error' && error.error_code === 'VALIDATION_ERROR') {
    // Handle validation errors
    console.error(error.errors)
  }
}
```

## Token Management

### Token Utilities (`utils/token.ts`)

Centralized token management - tokens stored in Pinia store only (no localStorage).

```typescript
import { getAccessToken, setAccessToken, clearTokens } from '@/utils/token'

// Get token (from auth store)
const token = getAccessToken()

// Set token (in auth store)
setAccessToken('new-token')

// Clear tokens
clearTokens()
```

**Rules:**
- Never access tokens directly in components
- Token is automatically attached via HTTP interceptor
- Tokens stored in memory (Pinia store) for security

## User Management

### User Utilities (`utils/user.ts`)

Centralized user extraction and normalization.

```typescript
import { getUser, getUserRole, isAdmin, isDealer, normalizeUser } from '@/utils/user'

// Get current user
const user = getUser() // Returns UserModel | null

// Get user role
const role = getUserRole() // Returns UserRole | string | null

// Check roles
if (isAdmin()) {
  // Admin-only code
}

if (isDealer()) {
  // Dealer-only code
}

// Normalize API user data
const normalizedUser = normalizeUser(apiUserData)
```

**Rules:**
- Always use mapped `UserModel`, never raw API user data
- User data normalized from snake_case to camelCase

## Permissions & Roles

### Permission Utilities (`utils/permissions.ts`)

Role and permission helpers that mirror backend permission matrix exactly.

```typescript
import { can, isAdmin, isDealer } from '@/utils/permissions'

// Check permission
if (can('vehicles', 'create')) {
  // User can create vehicles
}

if (can('leads', 'assign')) {
  // User can assign leads
}

// Check roles
if (isAdmin()) {
  // Admin access
}

if (isDealer()) {
  // Dealer access
}
```

**Permission Matrix:**

**Dealer Permissions:**
- `vehicles`: create, read, update, delete
- `leads`: read, update, assign
- `staff`: read, create, update, delete
- `profile`: read, update
- `subscription`: read
- `favorites`: read, create, delete
- `saved-searches`: read, create, delete

**Admin Permissions:**
- All permissions (full access)

## State Management

### Auth Store (`stores/auth.store.ts`)

Pinia store for authentication state.

```typescript
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

// State
authStore.user // UserModel | null
authStore.accessToken // string | null

// Computed
authStore.isAuthenticated // boolean
authStore.role // UserRole | string | null
authStore.isAdmin // boolean
authStore.isDealer // boolean
authStore.isSeller // boolean

// Actions
authStore.setUser(user)
authStore.setAccessToken(token)
authStore.setAuth(user, token)
authStore.logout()
authStore.clearAuth()
```

**Rules:**
- Store uses `UserModel` (not raw User interface)
- No token logic in components (all via store)
- Tokens stored in memory only

## Router Integration

The router uses new utilities for authentication and permissions.

```typescript
import { checkAuth } from '@/api/auth.api'
import { isAdmin, isDealer } from '@/utils/permissions'

// Router guard example
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      next('/auth/login')
    } else {
      next()
    }
  } else {
    next()
  }
})
```

## Usage Examples

### Component Example

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getVehicles, createVehicle } from '@/api/dealer.api'
import type { VehicleModel } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import { VehicleStatus } from '@/models/vehicle.model'

const vehicles = ref<VehicleModel[]>([])
const loading = ref(false)
const error = ref<ApiErrorModel | null>(null)

const loadVehicles = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getVehicles({ 
      page: 1, 
      limit: 15,
      status: VehicleStatus.PUBLISHED 
    })
    vehicles.value = response.docs
  } catch (err) {
    error.value = err as ApiErrorModel
  } finally {
    loading.value = false
  }
}

const handleCreateVehicle = async (data: any) => {
  try {
    const vehicle = await createVehicle(data)
    // Vehicle created successfully
    await loadVehicles()
  } catch (err) {
    error.value = err as ApiErrorModel
  }
}

onMounted(() => {
  loadVehicles()
})
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error.message }}</div>
    <div v-for="vehicle in vehicles" :key="vehicle.id">
      {{ vehicle.title }} - {{ vehicle.price }}
    </div>
  </div>
</template>
```

### Permission Check Example

```vue
<script setup lang="ts">
import { can } from '@/utils/permissions'

const canCreateVehicles = can('vehicles', 'create')
const canAssignLeads = can('leads', 'assign')
</script>

<template>
  <button v-if="canCreateVehicles" @click="createVehicle">
    Create Vehicle
  </button>
  <button v-if="canAssignLeads" @click="assignLead">
    Assign Lead
  </button>
</template>
```

### Pagination Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { getVehicles } from '@/api/dealer.api'
import type { PaginationModel, VehicleModel } from '@/models'

const pagination = ref<PaginationModel<VehicleModel> | null>(null)

const loadPage = async (page: number) => {
  const response = await getVehicles({ page, limit: 15 })
  pagination.value = response
}
</script>

<template>
  <div v-if="pagination">
    <div v-for="vehicle in pagination.docs" :key="vehicle.id">
      {{ vehicle.title }}
    </div>
    
    <button 
      v-if="pagination.hasPrevPage" 
      @click="loadPage(pagination.prevPage!)"
    >
      Previous
    </button>
    
    <button 
      v-if="pagination.hasNextPage" 
      @click="loadPage(pagination.nextPage!)"
    >
      Next
    </button>
  </div>
</template>
```

## Best Practices

### DO

✅ Use API modules for all API calls
```typescript
import { getVehicles } from '@/api/dealer.api'
```

✅ Use models for type safety
```typescript
import type { VehicleModel } from '@/models/vehicle.model'
```

✅ Use permission helpers
```typescript
import { can } from '@/utils/permissions'
if (can('vehicles', 'create')) { ... }
```

✅ Handle errors properly
```typescript
try {
  const data = await getVehicles()
} catch (error) {
  // error is ApiErrorModel
  console.error(error.message)
}
```

✅ Use pagination for lists
```typescript
const response = await getVehicles({ page: 1, limit: 15 })
```

### DON'T

❌ Don't use Axios directly in components
```typescript
// BAD
import axios from 'axios'
await axios.get('/api/v1/vehicles')

// GOOD
import { getVehicles } from '@/api/dealer.api'
await getVehicles()
```

❌ Don't hardcode URLs
```typescript
// BAD
await httpClient.get('/api/v1/dealer/vehicles')

// GOOD
import { DEALER_VEHICLE_ENDPOINTS } from '@/api/endpoints'
await httpClient.get(DEALER_VEHICLE_ENDPOINTS.LIST)
```

❌ Don't access tokens directly
```typescript
// BAD
const token = localStorage.getItem('token')

// GOOD
import { getAccessToken } from '@/utils/token'
const token = getAccessToken()
```

❌ Don't use raw API responses
```typescript
// BAD
const response = await httpClient.get('/vehicles')
const vehicles = response.data.data

// GOOD
import { getVehicles } from '@/api/dealer.api'
const response = await getVehicles()
const vehicles = response.docs // Already mapped to VehicleModel[]
```

## Migration Guide

### From Old Architecture

**1. Update Imports:**

```typescript
// OLD
import apiClient from '@/utils/axios'
import { login } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'

// NEW
import { login } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
// No need to import httpClient - use API modules
```

**2. Update Auth Store:**

```typescript
// OLD
import { useAuthStore } from '@/stores/auth'

// NEW
import { useAuthStore } from '@/stores/auth.store'
```

**3. Update API Calls:**

```typescript
// OLD
const response = await apiClient.get('/dealer/vehicles')
const vehicles = response.data.data

// NEW
import { getVehicles } from '@/api/dealer.api'
const response = await getVehicles()
const vehicles = response.docs // Already VehicleModel[]
```

**4. Update Error Handling:**

```typescript
// OLD
try {
  const response = await apiClient.get('/vehicles')
} catch (error: any) {
  if (error.response?.data) {
    console.error(error.response.data.message)
  }
}

// NEW
import { getVehicles } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'

try {
  const response = await getVehicles()
} catch (error) {
  const apiError = error as ApiErrorModel
  console.error(apiError.message)
  if (apiError.errors) {
    // Handle validation errors
  }
}
```

**5. Update Permission Checks:**

```typescript
// OLD
const authStore = useAuthStore()
if (authStore.user?.roles?.includes('admin')) {
  // ...
}

// NEW
import { isAdmin, can } from '@/utils/permissions'
if (isAdmin()) {
  // ...
}
if (can('vehicles', 'create')) {
  // ...
}
```

## API Endpoints Reference

All endpoints are centralized in `api/endpoints.ts`. See the file for complete list.

**Key Endpoint Groups:**
- `AUTH_ENDPOINTS` - Authentication routes
- `DEALER_VEHICLE_ENDPOINTS` - Dealer vehicle management
- `DEALER_LEAD_ENDPOINTS` - Dealer lead management
- `ADMIN_USER_ENDPOINTS` - Admin user management
- `ADMIN_DEALER_ENDPOINTS` - Admin dealer management
- `NUMMERPLADE_ENDPOINTS` - Nummerplade proxy routes
- And more...

## Error Handling Reference

### Error Types

**Standard API Errors:**
- `VALIDATION_ERROR` (422) - Validation failed
- `UNAUTHORIZED` (401) - Session expired
- `FORBIDDEN` (403) - Permission denied
- `RATE_LIMIT` (429) - Too many requests
- `SERVER_ERROR_*` (5xx) - Server errors

**Nummerplade Errors:**
- `TIMEOUT` - Request timed out (retryable)
- `RATE_LIMIT` - Rate limit exceeded (retryable)
- `INVALID_INPUT` - Invalid registration/VIN (not retryable)
- `SERVICE_DOWN` - External service unavailable (retryable)
- `UNKNOWN` - Unknown error (not retryable)

### Error Handling Example

```typescript
import { isRetryableError } from '@/models/api-error.model'
import { isNummerpladeError } from '@/models/api-error.model'

try {
  const data = await getVehicleByRegistration({ registration: 'AB12345' })
} catch (error) {
  if (isNummerpladeError(error)) {
    if (error.retryable) {
      // Retry logic
    }
  } else if (isRetryableError(error)) {
    // Retry logic for rate limits
  } else {
    // Show error to user
    console.error(error.message)
  }
}
```

## Testing

### Unit Testing API Modules

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getVehicles } from '@/api/dealer.api'
import httpClient from '@/api/http'

vi.mock('@/api/http')

describe('dealer.api', () => {
  it('should get vehicles', async () => {
    const mockResponse = {
      data: {
        docs: [{ id: 1, title: 'Test Vehicle' }],
        page: 1,
        limit: 15,
      }
    }
    
    vi.mocked(httpClient.get).mockResolvedValue(mockResponse)
    
    const result = await getVehicles({ page: 1, limit: 15 })
    
    expect(result.docs).toHaveLength(1)
    expect(result.docs[0].id).toBe(1)
  })
})
```

## Support

For questions or issues with the Vue API architecture, please refer to:
- Backend API Architecture: `backend/docs/api-architecture.md`
- This documentation: `panel_vue/docs/vue-architecture.md`
- Contact the development team

## Version History

- **v1.0** - Initial Vue 3 API architecture implementation (current)

