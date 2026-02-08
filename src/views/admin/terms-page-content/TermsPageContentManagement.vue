<template>
  <div class="terms-page-content-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">Terms of Service Content Management</h2>
        <p class="page-description">
          Manage all text content on the terms of service page. Changes are saved to the database and cache is automatically cleared.
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
      <p class="text-body-2 text-medium-emphasis mt-4">Loading terms of service content...</p>
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
                  :data-key="'terms_header_title'"
                  :data-placeholder="getPlaceholder('terms_header_title')"
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
                  :data-key="'terms_header_description'"
                  :data-placeholder="getPlaceholder('terms_header_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Agreement to Terms Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Agreement to Terms Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_agreement_title'"
                  :data-placeholder="getPlaceholder('terms_agreement_title')"
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
                  :data-key="'terms_agreement_description'"
                  :data-placeholder="getPlaceholder('terms_agreement_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Use License Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Use License Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_license_title'"
                  :data-placeholder="getPlaceholder('terms_license_title')"
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
                  :data-key="'terms_license_description'"
                  :data-placeholder="getPlaceholder('terms_license_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">List Items</div>
                <div class="editable-content-group">
                  <div class="editable-field" v-for="i in 5" :key="`license_item_${i}`">
                    <div class="field-label">Item {{ i }}</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="`terms_license_item_${i}`"
                      :data-placeholder="getPlaceholder(`terms_license_item_${i}`)"
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

        <!-- User Accounts Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">User Accounts Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_accounts_title'"
                  :data-placeholder="getPlaceholder('terms_accounts_title')"
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
                  :data-key="'terms_accounts_description'"
                  :data-placeholder="getPlaceholder('terms_accounts_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Vehicle Listings Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Vehicle Listings Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_listings_title'"
                  :data-placeholder="getPlaceholder('terms_listings_title')"
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
                  :data-key="'terms_listings_description'"
                  :data-placeholder="getPlaceholder('terms_listings_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">List Items</div>
                <div class="editable-content-group">
                  <div class="editable-field" v-for="i in 4" :key="`listings_item_${i}`">
                    <div class="field-label">Item {{ i }}</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="`terms_listings_item_${i}`"
                      :data-placeholder="getPlaceholder(`terms_listings_item_${i}`)"
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

        <!-- Prohibited Uses Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Prohibited Uses Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_prohibited_title'"
                  :data-placeholder="getPlaceholder('terms_prohibited_title')"
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
                  :data-key="'terms_prohibited_description'"
                  :data-placeholder="getPlaceholder('terms_prohibited_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="sub-section">
                <div class="sub-section-title">List Items</div>
                <div class="editable-content-group">
                  <div class="editable-field" v-for="i in 6" :key="`prohibited_item_${i}`">
                    <div class="field-label">Item {{ i }}</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="`terms_prohibited_item_${i}`"
                      :data-placeholder="getPlaceholder(`terms_prohibited_item_${i}`)"
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

        <!-- Disclaimer Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Disclaimer Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_disclaimer_title'"
                  :data-placeholder="getPlaceholder('terms_disclaimer_title')"
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
                  :data-key="'terms_disclaimer_description'"
                  :data-placeholder="getPlaceholder('terms_disclaimer_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Limitations Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Limitations Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_limitations_title'"
                  :data-placeholder="getPlaceholder('terms_limitations_title')"
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
                  :data-key="'terms_limitations_description'"
                  :data-placeholder="getPlaceholder('terms_limitations_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Accuracy of Materials Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Accuracy of Materials Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_accuracy_title'"
                  :data-placeholder="getPlaceholder('terms_accuracy_title')"
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
                  :data-key="'terms_accuracy_description'"
                  :data-placeholder="getPlaceholder('terms_accuracy_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Links Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Links Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_links_title'"
                  :data-placeholder="getPlaceholder('terms_links_title')"
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
                  :data-key="'terms_links_description'"
                  :data-placeholder="getPlaceholder('terms_links_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Modifications Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Modifications Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_modifications_title'"
                  :data-placeholder="getPlaceholder('terms_modifications_title')"
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
                  :data-key="'terms_modifications_description'"
                  :data-placeholder="getPlaceholder('terms_modifications_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Governing Law Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Governing Law Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'terms_governing_title'"
                  :data-placeholder="getPlaceholder('terms_governing_title')"
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
                  :data-key="'terms_governing_description'"
                  :data-placeholder="getPlaceholder('terms_governing_description')"
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
                  :data-key="'terms_contact_title'"
                  :data-placeholder="getPlaceholder('terms_contact_title')"
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
                  :data-key="'terms_contact_description'"
                  :data-placeholder="getPlaceholder('terms_contact_description')"
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
                      :data-key="'terms_contact_email'"
                      :data-placeholder="getPlaceholder('terms_contact_email')"
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
                      :data-key="'terms_contact_address'"
                      :data-placeholder="getPlaceholder('terms_contact_address')"
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
                  :data-key="'terms_last_updated'"
                  :data-placeholder="getPlaceholder('terms_last_updated')"
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
      Terms of service content updated successfully!
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
  getTermsPageContent,
  bulkUpdateTermsPageContent,
  type HomePageSectionModel,
} from '@/api/admin.api'

// Section definitions for placeholder lookup
const sectionDefinitions: Record<string, { placeholder: string }> = {
  terms_header_title: { placeholder: 'Terms of Service' },
  terms_header_description: { placeholder: 'Please read these terms and conditions carefully before using our website and services.' },
  terms_agreement_title: { placeholder: 'Agreement to Terms' },
  terms_agreement_description: { placeholder: 'By accessing or using Bilskyen\'s website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.' },
  terms_license_title: { placeholder: 'Use License' },
  terms_license_description: { placeholder: 'Permission is granted to temporarily download one copy of the materials on Bilskyen\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:' },
  terms_license_item_1: { placeholder: 'Modify or copy the materials' },
  terms_license_item_2: { placeholder: 'Use the materials for any commercial purpose or for any public display' },
  terms_license_item_3: { placeholder: 'Attempt to reverse engineer any software contained on the website' },
  terms_license_item_4: { placeholder: 'Remove any copyright or other proprietary notations from the materials' },
  terms_license_item_5: { placeholder: 'Transfer the materials to another person or "mirror" the materials on any other server' },
  terms_accounts_title: { placeholder: 'User Accounts' },
  terms_accounts_description: { placeholder: 'When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.' },
  terms_listings_title: { placeholder: 'Vehicle Listings' },
  terms_listings_description: { placeholder: 'All vehicle listings on our platform must be accurate and truthful. Sellers are responsible for:' },
  terms_listings_item_1: { placeholder: 'Providing accurate information about vehicles' },
  terms_listings_item_2: { placeholder: 'Ensuring all vehicles are legally owned and can be sold' },
  terms_listings_item_3: { placeholder: 'Maintaining the accuracy of listing information' },
  terms_listings_item_4: { placeholder: 'Responding to inquiries in a timely manner' },
  terms_prohibited_title: { placeholder: 'Prohibited Uses' },
  terms_prohibited_description: { placeholder: 'You may not use our service:' },
  terms_prohibited_item_1: { placeholder: 'For any unlawful purpose or to solicit others to perform unlawful acts' },
  terms_prohibited_item_2: { placeholder: 'To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances' },
  terms_prohibited_item_3: { placeholder: 'To infringe upon or violate our intellectual property rights or the intellectual property rights of others' },
  terms_prohibited_item_4: { placeholder: 'To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate' },
  terms_prohibited_item_5: { placeholder: 'To submit false or misleading information' },
  terms_prohibited_item_6: { placeholder: 'To upload or transmit viruses or any other type of malicious code' },
  terms_disclaimer_title: { placeholder: 'Disclaimer' },
  terms_disclaimer_description: { placeholder: 'The materials on Bilskyen\'s website are provided on an \'as is\' basis. Bilskyen makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.' },
  terms_limitations_title: { placeholder: 'Limitations' },
  terms_limitations_description: { placeholder: 'In no event shall Bilskyen or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Bilskyen\'s website, even if Bilskyen or a Bilskyen authorized representative has been notified orally or in writing of the possibility of such damage.' },
  terms_accuracy_title: { placeholder: 'Accuracy of Materials' },
  terms_accuracy_description: { placeholder: 'The materials appearing on Bilskyen\'s website could include technical, typographical, or photographic errors. Bilskyen does not warrant that any of the materials on its website are accurate, complete, or current. Bilskyen may make changes to the materials contained on its website at any time without notice.' },
  terms_links_title: { placeholder: 'Links' },
  terms_links_description: { placeholder: 'Bilskyen has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Bilskyen of the site. Use of any such linked website is at the user\'s own risk.' },
  terms_modifications_title: { placeholder: 'Modifications' },
  terms_modifications_description: { placeholder: 'Bilskyen may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.' },
  terms_governing_title: { placeholder: 'Governing Law' },
  terms_governing_description: { placeholder: 'These terms and conditions are governed by and construed in accordance with the laws of Denmark and you irrevocably submit to the exclusive jurisdiction of the courts in that location.' },
  terms_contact_title: { placeholder: 'Contact Us' },
  terms_contact_description: { placeholder: 'If you have any questions about these Terms of Service, please contact us at:' },
  terms_contact_email: { placeholder: 'legal@bilskyen.dk' },
  terms_contact_address: { placeholder: '123 Dealership Lane, Copenhagen, Denmark' },
  terms_last_updated: { placeholder: 'Last Updated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
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
    const data = await getTermsPageContent('terms')
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
    error.value = err.message || 'Failed to load terms of service content'
    console.error('Error loading terms of service content:', err)
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

    const updatedSections = await bulkUpdateTermsPageContent(sectionsToUpdate, 'terms')
    
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
    errorMessage.value = err.message || 'Failed to save terms of service content'
    showError.value = true
    console.error('Error saving terms of service content:', err)
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
.terms-page-content-container {
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
