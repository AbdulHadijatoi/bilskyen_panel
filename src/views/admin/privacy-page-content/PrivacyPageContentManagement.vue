<template>
  <div class="privacy-page-content-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">Privacy Policy Content Management</h2>
        <p class="page-description">
          Manage all text content on the privacy policy page. Changes are saved to the database and cache is automatically cleared.
        </p>
      </div>
      <div class="header-actions">
        <v-btn
          color="default"
          prepend-icon="mdi-chevron-up"
          variant="flat"
          @click="collapseAllPanels"
          class="collapse-button bg-success"
          :disabled="expandedPanels.length === 0"
        >
          Collapse All
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="saveAllSections"
          class="save-button"
        >
          Save All Changes
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !sections.length" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 text-medium-emphasis mt-4">Loading privacy policy content...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>Error Loading Content</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Content Form -->
    <div v-else class="content-sections">
      <v-expansion-panels v-model="expandedPanels" multiple class="expansion-panels">
        <!-- Header Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Header Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_header_title'"
                  :data-placeholder="getPlaceholder('privacy_header_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_header_description'"
                  :data-placeholder="getPlaceholder('privacy_header_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Introduction Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Introduction Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_intro_title'"
                  :data-placeholder="getPlaceholder('privacy_intro_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_intro_description'"
                  :data-placeholder="getPlaceholder('privacy_intro_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Information We Collect Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Information We Collect Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_collect_title'"
                  :data-placeholder="getPlaceholder('privacy_collect_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_collect_description'"
                  :data-placeholder="getPlaceholder('privacy_collect_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">List Items</div>
                <div class="editable-content-group">
                  <div class="editable-field" v-for="i in 5" :key="`collect_item_${i}`">
                    <div class="field-label">Item {{ i }}</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="`privacy_collect_item_${i}`"
                      :data-placeholder="getPlaceholder(`privacy_collect_item_${i}`)"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- How We Use Your Information Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">How We Use Your Information Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_use_title'"
                  :data-placeholder="getPlaceholder('privacy_use_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_use_description'"
                  :data-placeholder="getPlaceholder('privacy_use_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">List Items</div>
                <div class="editable-content-group">
                  <div class="editable-field" v-for="i in 5" :key="`use_item_${i}`">
                    <div class="field-label">Item {{ i }}</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="`privacy_use_item_${i}`"
                      :data-placeholder="getPlaceholder(`privacy_use_item_${i}`)"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Information Sharing Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Information Sharing Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_sharing_title'"
                  :data-placeholder="getPlaceholder('privacy_sharing_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_sharing_description'"
                  :data-placeholder="getPlaceholder('privacy_sharing_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">List Items</div>
                <div class="editable-content-group">
                  <div class="editable-field" v-for="i in 4" :key="`sharing_item_${i}`">
                    <div class="field-label">Item {{ i }}</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="`privacy_sharing_item_${i}`"
                      :data-placeholder="getPlaceholder(`privacy_sharing_item_${i}`)"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Data Security Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Data Security Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_security_title'"
                  :data-placeholder="getPlaceholder('privacy_security_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_security_description'"
                  :data-placeholder="getPlaceholder('privacy_security_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Your Rights Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Your Rights Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_rights_title'"
                  :data-placeholder="getPlaceholder('privacy_rights_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_rights_description'"
                  :data-placeholder="getPlaceholder('privacy_rights_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">List Items</div>
                <div class="editable-content-group">
                  <div class="editable-field" v-for="i in 6" :key="`rights_item_${i}`">
                    <div class="field-label">Item {{ i }}</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="`privacy_rights_item_${i}`"
                      :data-placeholder="getPlaceholder(`privacy_rights_item_${i}`)"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Cookies Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Cookies Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_cookies_title'"
                  :data-placeholder="getPlaceholder('privacy_cookies_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_cookies_description'"
                  :data-placeholder="getPlaceholder('privacy_cookies_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Changes to Privacy Policy Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Changes to Privacy Policy Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_changes_title'"
                  :data-placeholder="getPlaceholder('privacy_changes_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_changes_description'"
                  :data-placeholder="getPlaceholder('privacy_changes_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Contact Us Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Contact Us Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_contact_title'"
                  :data-placeholder="getPlaceholder('privacy_contact_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_contact_description'"
                  :data-placeholder="getPlaceholder('privacy_contact_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">Contact Information</div>
                <div class="editable-content-group two-column">
                  <div class="editable-field">
                    <div class="field-label">Email</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'privacy_contact_email'"
                      :data-placeholder="getPlaceholder('privacy_contact_email')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Address</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'privacy_contact_address'"
                      :data-placeholder="getPlaceholder('privacy_contact_address')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Last Updated Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Last Updated Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Last Updated Text</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'privacy_last_updated'"
                  :data-placeholder="getPlaceholder('privacy_last_updated')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      Privacy policy content updated successfully!
      <template #actions>
        <v-btn variant="text" @click="showSuccess = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template #actions>
        <v-btn variant="text" @click="showError = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, watch } from 'vue'
import {
  getPrivacyPageContent,
  bulkUpdatePrivacyPageContent,
  type HomePageSectionModel,
} from '@/api/admin.api'

// Section definitions for placeholder lookup
const sectionDefinitions: Record<string, { placeholder: string }> = {
  privacy_header_title: { placeholder: 'Privacy Policy' },
  privacy_header_description: { placeholder: 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.' },
  privacy_intro_title: { placeholder: 'Introduction' },
  privacy_intro_description: { placeholder: 'At Bilskyen, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.' },
  privacy_collect_title: { placeholder: 'Information We Collect' },
  privacy_collect_description: { placeholder: 'We collect information that you provide directly to us, including:' },
  privacy_collect_item_1: { placeholder: 'Personal identification information (name, email address, phone number)' },
  privacy_collect_item_2: { placeholder: 'Vehicle inquiry and contact form submissions' },
  privacy_collect_item_3: { placeholder: 'Account information when you create an account' },
  privacy_collect_item_4: { placeholder: 'Payment information for transactions' },
  privacy_collect_item_5: { placeholder: 'Communication preferences and feedback' },
  privacy_use_title: { placeholder: 'How We Use Your Information' },
  privacy_use_description: { placeholder: 'We use the information we collect to:' },
  privacy_use_item_1: { placeholder: 'Process and respond to your inquiries and requests' },
  privacy_use_item_2: { placeholder: 'Provide, maintain, and improve our services' },
  privacy_use_item_3: { placeholder: 'Send you important updates and communications' },
  privacy_use_item_4: { placeholder: 'Process transactions and send related information' },
  privacy_use_item_5: { placeholder: 'Detect, prevent, and address technical issues and fraud' },
  privacy_sharing_title: { placeholder: 'Information Sharing and Disclosure' },
  privacy_sharing_description: { placeholder: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:' },
  privacy_sharing_item_1: { placeholder: 'With service providers who assist us in operating our website and conducting our business' },
  privacy_sharing_item_2: { placeholder: 'When required by law or to protect our rights and safety' },
  privacy_sharing_item_3: { placeholder: 'In connection with a business transfer or merger' },
  privacy_sharing_item_4: { placeholder: 'With your explicit consent' },
  privacy_security_title: { placeholder: 'Data Security' },
  privacy_security_description: { placeholder: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.' },
  privacy_rights_title: { placeholder: 'Your Rights' },
  privacy_rights_description: { placeholder: 'You have the right to:' },
  privacy_rights_item_1: { placeholder: 'Access and receive a copy of your personal data' },
  privacy_rights_item_2: { placeholder: 'Request correction of inaccurate or incomplete data' },
  privacy_rights_item_3: { placeholder: 'Request deletion of your personal data' },
  privacy_rights_item_4: { placeholder: 'Object to processing of your personal data' },
  privacy_rights_item_5: { placeholder: 'Request restriction of processing your personal data' },
  privacy_rights_item_6: { placeholder: 'Data portability' },
  privacy_cookies_title: { placeholder: 'Cookies and Tracking Technologies' },
  privacy_cookies_description: { placeholder: 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.' },
  privacy_changes_title: { placeholder: 'Changes to This Privacy Policy' },
  privacy_changes_description: { placeholder: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.' },
  privacy_contact_title: { placeholder: 'Contact Us' },
  privacy_contact_description: { placeholder: 'If you have any questions about this Privacy Policy, please contact us at:' },
  privacy_contact_email: { placeholder: 'privacy@bilskyen.dk' },
  privacy_contact_address: { placeholder: '123 Dealership Lane, Copenhagen, Denmark' },
  privacy_last_updated: { placeholder: 'Last Updated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
}

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const sections = ref<HomePageSectionModel[]>([])
const expandedPanels = ref<number[]>([])

// Form data - reactive object with all section keys
const formData = reactive<Record<string, string>>({})

// Initialize form data with empty strings for all sections
Object.keys(sectionDefinitions).forEach((key) => {
  formData[key] = ''
})

/**
 * Get placeholder text for a section key
 */
function getPlaceholder(key: string): string {
  return sectionDefinitions[key]?.placeholder || ''
}

/**
 * Handle content change from contenteditable div
 */
function handleContentChange(event: Event) {
  const target = event.target as HTMLElement
  const key = target.getAttribute('data-key')
  if (key) {
    const text = target.innerText.trim()
    const placeholder = getPlaceholder(key)
    // Update formData if text is different from placeholder or not empty
    if (text && text !== placeholder) {
      formData[key] = text
    } else if (!text) {
      formData[key] = ''
    }
  }
}

/**
 * Handle input event
 */
function handleInput(event: Event) {
  // Input is handled, just prevent default behavior if needed
}

/**
 * Handle focus event to populate field with actual value or clear placeholder
 */
function handleFocus(event: Event) {
  const target = event.target as HTMLElement
  const key = target.getAttribute('data-key')
  if (key) {
    const value = formData[key]
    const currentText = target.innerText.trim()
    const placeholder = getPlaceholder(key)
    
    // If there's a value in formData, always show it
    if (value && value.trim()) {
      if (currentText !== value) {
        target.innerText = value
      }
    } else {
      // If no value, clear placeholder text so user can type
      if (currentText === placeholder || !currentText) {
        target.innerText = ''
      }
    }
  }
}

/**
 * Update all contenteditable elements with current formData values
 */
async function updateContenteditableElements() {
  await nextTick()
  const elements = document.querySelectorAll('[contenteditable][data-key]')
  elements.forEach((el) => {
    const key = el.getAttribute('data-key')
    if (key) {
      const value = formData[key]
      const currentText = (el as HTMLElement).innerText.trim()
      const placeholder = getPlaceholder(key)
      
      // Only update if the element doesn't have focus
      if (document.activeElement !== el) {
        if (value && value.trim()) {
          // Always set the actual value if it exists
          if (currentText !== value && currentText !== placeholder) {
            (el as HTMLElement).innerText = value
          } else if (currentText === placeholder) {
            // Replace placeholder with actual value
            (el as HTMLElement).innerText = value
          }
        } else {
          // Clear if empty (placeholder will show via CSS)
          if (currentText && currentText !== placeholder) {
            (el as HTMLElement).innerText = ''
          }
        }
      }
    }
  })
}

// Watch formData changes to update contenteditable elements (when not focused)
watch(
  () => formData,
  () => {
    updateContenteditableElements()
  },
  { deep: true }
)

// Watch for panel expansion to update contenteditable elements when panels open
watch(
  () => expandedPanels.value,
  () => {
    // Wait for panel animation to complete
    setTimeout(() => {
      updateContenteditableElements()
      updateExpandedPanelColors()
    }, 300)
  },
  { deep: true }
)

/**
 * Update alternating background colors for expanded panels
 */
function updateExpandedPanelColors() {
  nextTick(() => {
    const panels = document.querySelectorAll('.expansion-panels .v-expansion-panel')
    let expandedIndex = 0
    
    panels.forEach((panel) => {
      const isExpanded = panel.classList.contains('v-expansion-panel--active')
      const textWrapper = panel.querySelector('.v-expansion-panel-text__wrapper') as HTMLElement
      const title = panel.querySelector('.v-expansion-panel-title') as HTMLElement
      
      if (isExpanded) {
        // Remove previous color classes
        panel.classList.remove('expanded-odd', 'expanded-even')
        textWrapper?.classList.remove('expanded-odd', 'expanded-even')
        title?.classList.remove('expanded-odd', 'expanded-even')
        
        // Add alternating class based on expanded panel sequence
        if (expandedIndex % 2 === 0) {
          panel.classList.add('expanded-odd')
          textWrapper?.classList.add('expanded-odd')
          title?.classList.add('expanded-odd')
        } else {
          panel.classList.add('expanded-even')
          textWrapper?.classList.add('expanded-even')
          title?.classList.add('expanded-even')
        }
        expandedIndex++
      } else {
        // Remove color classes from collapsed panels
        panel.classList.remove('expanded-odd', 'expanded-even')
        textWrapper?.classList.remove('expanded-odd', 'expanded-even')
        title?.classList.remove('expanded-odd', 'expanded-even')
      }
    })
  })
}

/**
 * Load privacy page content
 */
async function loadContent() {
  loading.value = true
  error.value = null

  try {
    const data = await getPrivacyPageContent('privacy')
    sections.value = data

    // Populate form data with existing content
    data.forEach((section) => {
      if (formData.hasOwnProperty(section.sectionKey)) {
        // Always set the value, even if null (will be empty string)
        formData[section.sectionKey] = section.content || ''
      }
    })
    
    // Wait a bit for panels to render if any are expanded
    await nextTick()
    // Update contenteditable elements after data is loaded
    await updateContenteditableElements()
    
    // Also watch for panel expansion to update elements when panels open
    setTimeout(() => {
      updateContenteditableElements()
    }, 100)
  } catch (err: any) {
    error.value = err.message || 'Failed to load privacy policy content'
    console.error('Error loading privacy policy content:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Save all sections
 */
async function saveAllSections() {
  saving.value = true
  errorMessage.value = ''
  showError.value = false

  try {
    // Prepare sections data (only include non-empty or existing sections)
    const sectionsToUpdate: Record<string, string | null> = {}
    
    Object.keys(sectionDefinitions).forEach((key) => {
      const value = formData[key]
      // Include if it has a value or if it exists in the database
      if (value !== undefined && value !== null) {
        sectionsToUpdate[key] = value || null
      }
    })

    const updatedSections = await bulkUpdatePrivacyPageContent(sectionsToUpdate, 'privacy')
    
    // Update local state with the response instead of making another API call
    sections.value = updatedSections
    
    // Update form data with the response (in case any fields were modified server-side)
    updatedSections.forEach((section) => {
      if (formData.hasOwnProperty(section.sectionKey)) {
        formData[section.sectionKey] = section.content || ''
      }
    })
    
    // Update contenteditable elements after save
    await updateContenteditableElements()
    
    showSuccess.value = true
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to save privacy policy content'
    showError.value = true
    console.error('Error saving privacy policy content:', err)
  } finally {
    saving.value = false
  }
}

/**
 * Collapse all expanded panels
 */
function collapseAllPanels() {
  expandedPanels.value = []
}

onMounted(async () => {
  await loadContent()
  // Initial update of contenteditable elements after mount
  await updateContenteditableElements()
  // Update panel colors after initial load
  updateExpandedPanelColors()
})
</script>

<style scoped>
.privacy-page-content-container {
  padding: 16px;
  background-color: #fafafa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.page-description {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.collapse-button {
  flex-shrink: 0;
}

.save-button {
  flex-shrink: 0;
}

.content-sections {
  max-width: 1200px;
  margin: 0 auto;
}

.expansion-panels {
  background: transparent;
}

.expansion-panels :deep(.v-expansion-panel) {
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  margin-bottom: 0;
  box-shadow: none !important;
  transition: all 0.15s ease;
}

.expansion-panels :deep(.v-expansion-panel + .v-expansion-panel) {
  margin-top: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.expansion-panels :deep(.v-expansion-panel--active) {
  border-radius: 0 !important;
}

.expansion-panels :deep(.v-expansion-panel--active:first-child) {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.expansion-panels :deep(.v-expansion-panel--active:last-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.expansion-panels :deep(.v-expansion-panel--active:not(:first-child):not(:last-child)) {
  border-radius: 0 !important;
}

.expansion-panels :deep(.v-expansion-panel--active + .v-expansion-panel) {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.expansion-panels :deep(.v-expansion-panel:has(+ .v-expansion-panel--active)) {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.expansion-panels :deep(.v-expansion-panel--active .v-expansion-panel-text__wrapper) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.expansion-panels :deep(.v-expansion-panel.expanded-odd) {
  background-color: #ffffff !important;
}

.expansion-panels :deep(.v-expansion-panel.expanded-even) {
  background-color: #f8f9fa !important;
}

.expansion-panels :deep(.v-expansion-panel.expanded-odd .v-expansion-panel-text__wrapper),
.expansion-panels :deep(.v-expansion-panel.expanded-odd .v-expansion-panel-title) {
  background-color: #ffffff !important;
}

.expansion-panels :deep(.v-expansion-panel.expanded-even .v-expansion-panel-text__wrapper),
.expansion-panels :deep(.v-expansion-panel.expanded-even .v-expansion-panel-title) {
  background-color: #f8f9fa !important;
}

.expansion-panels :deep(.v-expansion-panel-title) {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  min-height: 40px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.expansion-panels :deep(.v-expansion-panel--active .v-expansion-panel-title) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(0, 74, 173, 0.02);
}

.expansion-panels :deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}

.panel-title-text {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  letter-spacing: -0.01em;
}

.editable-content-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editable-content-group.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 768px) {
  .editable-content-group.two-column {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .save-button {
    margin-left: 0;
    width: 100%;
  }
}

.field-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
  padding: 2px 6px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
  display: inline-block;
  width: fit-content;
  border: 1px solid rgba(0, 0, 0, 0.05);
  line-height: 1.4;
}

.editable-text {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.9);
  padding: 8px 10px;
  min-height: 20px;
  outline: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  cursor: text;
  word-wrap: break-word;
  white-space: pre-wrap;
  border-radius: 4px;
  transition: all 0.15s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.editable-text:hover {
  border-color: rgba(0, 74, 173, 0.25);
  background-color: #fafafa;
}

.editable-text:empty:not(:focus):before {
  content: attr(data-placeholder);
  color: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.editable-text:focus {
  outline: none;
  background-color: #ffffff;
  border-color: rgba(0, 74, 173, 0.4);
  border-width: 1px;
  padding: 8px 10px;
  box-shadow: none;
}

.editable-text[contenteditable="true"]:empty:before {
  content: attr(data-placeholder);
  color: rgba(0, 0, 0, 0.38);
}

.sub-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.sub-section:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.sub-section-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 2px 0;
}

.expansion-panels :deep(.v-expansion-panel-title__overlay) {
  opacity: 0;
}

.expansion-panels :deep(.v-expansion-panel-title__icon) {
  margin-inline-start: auto;
}

.expansion-panels :deep(.v-expansion-panel-title) {
  flex-direction: row;
  align-items: center;
}
</style>
