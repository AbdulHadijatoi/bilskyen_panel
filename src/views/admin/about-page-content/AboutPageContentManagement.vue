<template>
  <div class="about-page-content-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">About Page Content Management</h2>
        <p class="page-description">
          Manage all text content and images on the about page. Changes are saved to the database and cache is automatically cleared.
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
      <p class="text-body-2 text-medium-emphasis mt-4">Loading about page content...</p>
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
                  :data-key="'about_header_title'"
                  :data-placeholder="getPlaceholder('about_header_title')"
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
                  :data-key="'about_header_description'"
                  :data-placeholder="getPlaceholder('about_header_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Mission Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Mission Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Label</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_mission_label'"
                  :data-placeholder="getPlaceholder('about_mission_label')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_mission_title'"
                  :data-placeholder="getPlaceholder('about_mission_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description 1</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_mission_description_1'"
                  :data-placeholder="getPlaceholder('about_mission_description_1')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description 2</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_mission_description_2'"
                  :data-placeholder="getPlaceholder('about_mission_description_2')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Mission Image</div>
                <div class="image-upload-section">
                  <div v-if="getImageForSection('about_mission_image')" class="image-preview-container">
                    <img 
                      :src="getImageForSection('about_mission_image')?.imageUrl" 
                      :alt="getImageForSection('about_mission_image')?.altText || 'Mission image'"
                      class="image-preview"
                    />
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      size="small"
                      class="delete-image-btn"
                      @click="confirmDeleteImage(getImageForSection('about_mission_image')?.id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <v-file-input
                    v-model="imageFiles['about_mission_image']"
                    label="Upload Image"
                    accept="image/*"
                    variant="outlined"
                    density="compact"
                    prepend-icon="mdi-image"
                    hide-details="auto"
                    @update:model-value="handleImageFileSelect('about_mission_image', $event)"
                  />
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Values Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Values Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Section Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_values_title'"
                  :data-placeholder="getPlaceholder('about_values_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Section Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_values_description'"
                  :data-placeholder="getPlaceholder('about_values_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              
              <!-- Value 1 -->
              <div class="sub-section">
                <div class="sub-section-title">Value 1</div>
                <div class="editable-content-group two-column">
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_1_title'"
                      :data-placeholder="getPlaceholder('about_value_1_title')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_1_description'"
                      :data-placeholder="getPlaceholder('about_value_1_description')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Value 2 -->
              <div class="sub-section">
                <div class="sub-section-title">Value 2</div>
                <div class="editable-content-group two-column">
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_2_title'"
                      :data-placeholder="getPlaceholder('about_value_2_title')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_2_description'"
                      :data-placeholder="getPlaceholder('about_value_2_description')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Value 3 -->
              <div class="sub-section">
                <div class="sub-section-title">Value 3</div>
                <div class="editable-content-group two-column">
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_3_title'"
                      :data-placeholder="getPlaceholder('about_value_3_title')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_3_description'"
                      :data-placeholder="getPlaceholder('about_value_3_description')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Value 4 -->
              <div class="sub-section">
                <div class="sub-section-title">Value 4</div>
                <div class="editable-content-group two-column">
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_4_title'"
                      :data-placeholder="getPlaceholder('about_value_4_title')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_value_4_description'"
                      :data-placeholder="getPlaceholder('about_value_4_description')"
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

        <!-- Team Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Team Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Section Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_team_title'"
                  :data-placeholder="getPlaceholder('about_team_title')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Section Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_team_description'"
                  :data-placeholder="getPlaceholder('about_team_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
              
              <!-- Team Member 1 -->
              <div class="sub-section">
                <div class="sub-section-title">Team Member 1</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Name</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_team_member_1_name'"
                      :data-placeholder="getPlaceholder('about_team_member_1_name')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Role</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_team_member_1_role'"
                      :data-placeholder="getPlaceholder('about_team_member_1_role')"
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
                      :data-key="'about_team_member_1_description'"
                      :data-placeholder="getPlaceholder('about_team_member_1_description')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Team Member Image</div>
                    <div class="image-upload-section">
                      <div v-if="getImageForSection('about_team_member_1_image')" class="image-preview-container">
                        <img 
                          :src="getImageForSection('about_team_member_1_image')?.imageUrl" 
                          :alt="getImageForSection('about_team_member_1_image')?.altText || 'Team member 1'"
                          class="image-preview"
                        />
                        <v-btn
                          icon
                          variant="text"
                          color="error"
                          size="small"
                          class="delete-image-btn"
                          @click="confirmDeleteImage(getImageForSection('about_team_member_1_image')?.id)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                      <v-file-input
                        v-model="imageFiles['about_team_member_1_image']"
                        label="Upload Image"
                        accept="image/*"
                        variant="outlined"
                        density="compact"
                        prepend-icon="mdi-image"
                        hide-details="auto"
                        @update:model-value="handleImageFileSelect('about_team_member_1_image', $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Team Member 2 -->
              <div class="sub-section">
                <div class="sub-section-title">Team Member 2</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Name</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_team_member_2_name'"
                      :data-placeholder="getPlaceholder('about_team_member_2_name')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Role</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_team_member_2_role'"
                      :data-placeholder="getPlaceholder('about_team_member_2_role')"
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
                      :data-key="'about_team_member_2_description'"
                      :data-placeholder="getPlaceholder('about_team_member_2_description')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Team Member Image</div>
                    <div class="image-upload-section">
                      <div v-if="getImageForSection('about_team_member_2_image')" class="image-preview-container">
                        <img 
                          :src="getImageForSection('about_team_member_2_image')?.imageUrl" 
                          :alt="getImageForSection('about_team_member_2_image')?.altText || 'Team member 2'"
                          class="image-preview"
                        />
                        <v-btn
                          icon
                          variant="text"
                          color="error"
                          size="small"
                          class="delete-image-btn"
                          @click="confirmDeleteImage(getImageForSection('about_team_member_2_image')?.id)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                      <v-file-input
                        v-model="imageFiles['about_team_member_2_image']"
                        label="Upload Image"
                        accept="image/*"
                        variant="outlined"
                        density="compact"
                        prepend-icon="mdi-image"
                        hide-details="auto"
                        @update:model-value="handleImageFileSelect('about_team_member_2_image', $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Team Member 3 -->
              <div class="sub-section">
                <div class="sub-section-title">Team Member 3</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Name</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_team_member_3_name'"
                      :data-placeholder="getPlaceholder('about_team_member_3_name')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Role</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'about_team_member_3_role'"
                      :data-placeholder="getPlaceholder('about_team_member_3_role')"
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
                      :data-key="'about_team_member_3_description'"
                      :data-placeholder="getPlaceholder('about_team_member_3_description')"
                      @blur="handleContentChange"
                      @input="handleInput"
                      @focus="handleFocus"
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Team Member Image</div>
                    <div class="image-upload-section">
                      <div v-if="getImageForSection('about_team_member_3_image')" class="image-preview-container">
                        <img 
                          :src="getImageForSection('about_team_member_3_image')?.imageUrl" 
                          :alt="getImageForSection('about_team_member_3_image')?.altText || 'Team member 3'"
                          class="image-preview"
                        />
                        <v-btn
                          icon
                          variant="text"
                          color="error"
                          size="small"
                          class="delete-image-btn"
                          @click="confirmDeleteImage(getImageForSection('about_team_member_3_image')?.id)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                      <v-file-input
                        v-model="imageFiles['about_team_member_3_image']"
                        label="Upload Image"
                        accept="image/*"
                        variant="outlined"
                        density="compact"
                        prepend-icon="mdi-image"
                        hide-details="auto"
                        @update:model-value="handleImageFileSelect('about_team_member_3_image', $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- CTA Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">CTA Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'about_cta_title'"
                  :data-placeholder="getPlaceholder('about_cta_title')"
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
                  :data-key="'about_cta_description'"
                  :data-placeholder="getPlaceholder('about_cta_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Save Button -->
      <div class="d-flex justify-end mt-4 mb-6">
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          size="default"
          :loading="saving"
          :disabled="saving"
          @click="saveAllSections"
        >
          Save All Changes
        </v-btn>
      </div>
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      About page content updated successfully!
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

    <!-- Delete Image Confirmation Dialog -->
    <v-dialog v-model="showDeleteImageDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="error" size="18" class="mr-2">mdi-delete</v-icon>
          Delete Image
        </v-card-title>
        <v-card-text class="pa-3">
          <p class="text-body-2">
            Are you sure you want to delete this image?
          </p>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="showDeleteImageDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            size="small"
            @click="deleteImage"
            :loading="deletingImage"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, watch } from 'vue'
import {
  getAboutPageContent,
  bulkUpdateAboutPageContent,
  uploadAboutPageImage,
  deleteAboutPageImage,
  type HomePageSectionModel,
} from '@/api/admin.api'
import type { AboutPageContentMap, PageImageModel, PageImagesMap } from '@/models/home-page-content.model'

// Section definitions for placeholder lookup
const sectionDefinitions: Record<string, { placeholder: string }> = {
  about_header_title: { placeholder: 'About Bilskyen' },
  about_header_description: { placeholder: 'We are dedicated to revolutionizing the dealership industry with cutting-edge technology and a passion for excellence.' },
  about_mission_label: { placeholder: 'Our Mission' },
  about_mission_title: { placeholder: 'Empowering Dealerships Through Innovation' },
  about_mission_description_1: { placeholder: 'Bilskyen was born from a simple idea: to create a dealership management system that is powerful, intuitive, and affordable. We saw the challenges dealerships faced with outdated, complex software and knew there was a better way.' },
  about_mission_description_2: { placeholder: 'Our mission is to provide a comprehensive, all-in-one platform that streamlines every aspect of dealership operations, from inventory management and sales to accounting and customer relations. We empower owners and staff to work smarter, not harder, freeing them to focus on what truly matters: building relationships and growing their business.' },
  about_values_title: { placeholder: 'Our Values' },
  about_values_description: { placeholder: 'The principles that guide every decision we make.' },
  about_value_1_title: { placeholder: 'Innovation' },
  about_value_1_description: { placeholder: "We constantly push the boundaries of what's possible, integrating the latest technology to solve real-world dealership challenges." },
  about_value_2_title: { placeholder: 'Transparency' },
  about_value_2_description: { placeholder: "We believe in honest, clear communication and pricing. What you see is what you get, from our software to our support." },
  about_value_3_title: { placeholder: 'Customer-Centricity' },
  about_value_3_description: { placeholder: 'Our customers are our partners. We succeed when they succeed, and we\'re dedicated to providing exceptional support and value.' },
  about_value_4_title: { placeholder: 'Integrity' },
  about_value_4_description: { placeholder: 'We operate with the highest ethical standards, building trust through reliability, honesty, and a commitment to excellence.' },
  about_team_title: { placeholder: 'Meet the Team' },
  about_team_description: { placeholder: 'The passionate individuals driving Bilskyen forward.' },
  about_team_member_1_name: { placeholder: 'Muhammed Rahif' },
  about_team_member_1_role: { placeholder: 'Founder & CEO' },
  about_team_member_1_description: { placeholder: 'With a passion for technology and the automotive industry, Muhammed founded Bilskyen to bring modern, efficient solutions to dealerships.' },
  about_team_member_2_name: { placeholder: 'Jane Doe' },
  about_team_member_2_role: { placeholder: 'Lead Developer' },
  about_team_member_2_description: { placeholder: 'Jane is the architect behind our robust platform, ensuring a seamless and powerful user experience.' },
  about_team_member_3_name: { placeholder: 'John Smith' },
  about_team_member_3_role: { placeholder: 'Head of Sales' },
  about_team_member_3_description: { placeholder: 'John connects with our clients, understanding their needs and helping them leverage Bilskyen for maximum growth.' },
  about_cta_title: { placeholder: 'Join the Revolution' },
  about_cta_description: { placeholder: 'Ready to see how Bilskyen can transform your dealership? Explore our features or get in touch with our team today.' },
}

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const sections = ref<HomePageSectionModel[]>([])
const images = ref<PageImagesMap>({})
const expandedPanels = ref<number[]>([])
const imageFiles = reactive<Record<string, File | null>>({})
const showDeleteImageDialog = ref(false)
const deletingImage = ref(false)
const imageToDelete = ref<number | null>(null)

// Form data - reactive object with all section keys
const formData = reactive<AboutPageContentMap>({})

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
 * Get image for a section
 */
function getImageForSection(sectionKey: string): PageImageModel | null {
  const sectionImages = images.value[sectionKey]
  if (sectionImages && sectionImages.length > 0) {
    return sectionImages[0]
  }
  return null
}

/**
 * Handle image file selection
 */
async function handleImageFileSelect(sectionKey: string, file: File | null) {
  if (!file) return

  try {
    const uploadedImage = await uploadAboutPageImage(sectionKey, file, undefined, 0, 'about')
    
    // Update images map
    if (!images.value[sectionKey]) {
      images.value[sectionKey] = []
    }
    images.value[sectionKey] = [uploadedImage]
    
    // Clear file input
    imageFiles[sectionKey] = null
    
    showSuccess.value = true
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to upload image'
    showError.value = true
    console.error('Error uploading image:', err)
  }
}

/**
 * Confirm delete image
 */
function confirmDeleteImage(imageId: number | undefined) {
  if (imageId) {
    imageToDelete.value = imageId
    showDeleteImageDialog.value = true
  }
}

/**
 * Delete image
 */
async function deleteImage() {
  if (!imageToDelete.value) return

  deletingImage.value = true
  try {
    await deleteAboutPageImage(imageToDelete.value)
    
    // Remove from images map
    Object.keys(images.value).forEach((key) => {
      images.value[key] = images.value[key].filter(img => img.id !== imageToDelete.value)
    })
    
    showDeleteImageDialog.value = false
    imageToDelete.value = null
    showSuccess.value = true
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to delete image'
    showError.value = true
    console.error('Error deleting image:', err)
  } finally {
    deletingImage.value = false
  }
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
 * Load about page content
 */
async function loadContent() {
  loading.value = true
  error.value = null

  try {
    const data = await getAboutPageContent('about')
    sections.value = data.sections
    images.value = data.images

    // Populate form data with existing content
    data.sections.forEach((section) => {
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
    error.value = err.message || 'Failed to load about page content'
    console.error('Error loading about page content:', err)
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
    const sectionsToUpdate: AboutPageContentMap = {}
    
    Object.keys(sectionDefinitions).forEach((key) => {
      const value = formData[key]
      // Include if it has a value or if it exists in the database
      if (value !== undefined && value !== null) {
        sectionsToUpdate[key] = value || null
      }
    })

    const updatedSections = await bulkUpdateAboutPageContent(sectionsToUpdate, 'about')
    
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
    errorMessage.value = err.message || 'Failed to save about page content'
    showError.value = true
    console.error('Error saving about page content:', err)
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
.about-page-content-container {
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
  padding: 0;
}

.editable-content-group.two-column > .editable-field:first-child {
  padding-right: 10px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.editable-content-group.two-column > .editable-field:nth-child(2) {
  padding-left: 10px;
}

@media (max-width: 768px) {
  .editable-content-group.two-column {
    grid-template-columns: 1fr;
  }
  
  .editable-content-group.two-column > .editable-field:first-child {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding-bottom: 12px;
    margin-bottom: 0;
  }
  
  .editable-content-group.two-column > .editable-field:nth-child(2) {
    padding-left: 0;
    padding-top: 12px;
  }
}

.editable-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.editable-field.full-width {
  grid-column: 1 / -1;
  padding-left: 0 !important;
  padding-right: 0 !important;
  border: none !important;
}

.sub-section .editable-content-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0;
}

.sub-section .editable-content-group > .editable-field:first-child {
  padding-right: 10px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.sub-section .editable-content-group > .editable-field:nth-child(2) {
  padding-left: 10px;
}

.sub-section .editable-field.full-width {
  grid-column: 1 / -1;
  padding-left: 0 !important;
  padding-right: 0 !important;
  border: none !important;
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

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  max-width: 300px;
}

.image-preview {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.delete-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .save-button {
    margin-left: 0;
    width: 100%;
  }
}
</style>
