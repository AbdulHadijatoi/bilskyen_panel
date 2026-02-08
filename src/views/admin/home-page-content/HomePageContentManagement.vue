<template>
  <div class="home-page-content-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">Home Page Content Management</h2>
        <p class="page-description">
          Manage all text content on the home page. Changes are saved to the database and cache is automatically cleared.
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
      <p class="text-body-2 text-medium-emphasis mt-4">Loading home page content...</p>
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
        <!-- Search Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Search Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'search_title'"
                  :data-placeholder="getPlaceholder('search_title')"
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
                  :data-key="'search_description'"
                  :data-placeholder="getPlaceholder('search_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Hero Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Hero Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group">
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'hero_description'"
                  :data-placeholder="getPlaceholder('hero_description')"
                  @blur="handleContentChange"
                  @input="handleInput"
                  @focus="handleFocus"
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Featured Vehicles Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Featured Vehicles Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'featured_vehicles_title'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('featured_vehicles_title')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'featured_vehicles_description'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('featured_vehicles_description')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Stats Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Stats Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Section Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'stats_title'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('stats_title')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Section Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'stats_description'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('stats_description')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              
              <!-- Stat 1 -->
              <div class="sub-section">
                <div class="sub-section-title">Stat 1</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Value</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_1_value'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_1_value')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_1_title'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_1_title')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_1_description'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_1_description')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Stat 2 -->
              <div class="sub-section">
                <div class="sub-section-title">Stat 2</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Value</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_2_value'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_2_value')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_2_title'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_2_title')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_2_description'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_2_description')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Stat 3 -->
              <div class="sub-section">
                <div class="sub-section-title">Stat 3</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Value</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_3_value'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_3_value')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_3_title'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_3_title')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_3_description'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('stat_3_description')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Stat 4 -->
              <div class="sub-section">
                <div class="sub-section-title">Stat 4</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Value</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_4_value'"
                      @blur="handleContentChange"
                      @input="handleInput"
                  :data-placeholder="getPlaceholder('stat_4_value')"
                  @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_4_title'"
                      @blur="handleContentChange"
                      @input="handleInput"
                  :data-placeholder="getPlaceholder('stat_4_title')"
                  @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'stat_4_description'"
                      @blur="handleContentChange"
                      @input="handleInput"
                  :data-placeholder="getPlaceholder('stat_4_description')"
                  @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Features Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Features Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Section Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'features_title'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('features_title')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Section Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'features_description'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('features_description')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              
              <!-- Feature 1 -->
              <div class="sub-section">
                <div class="sub-section-title">Feature 1</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'feature_1_title'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('feature_1_title')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'feature_1_description'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('feature_1_description')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Feature 2 -->
              <div class="sub-section">
                <div class="sub-section-title">Feature 2</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'feature_2_title'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('feature_2_title')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'feature_2_description'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('feature_2_description')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Feature 3 -->
              <div class="sub-section">
                <div class="sub-section-title">Feature 3</div>
                <div class="editable-content-group">
                  <div class="editable-field">
                    <div class="field-label">Title</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'feature_3_title'"
                      @blur="handleContentChange"
                      @input="handleInput"
                  :data-placeholder="getPlaceholder('feature_3_title')"
                  @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Description</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'feature_3_description'"
                      @blur="handleContentChange"
                      @input="handleInput"
                  :data-placeholder="getPlaceholder('feature_3_description')"
                  @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Testimonials Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Testimonials Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">Section Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'testimonials_title'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('testimonials_title')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">Section Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'testimonials_description'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('testimonials_description')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              
              <!-- Testimonial 1 -->
              <div class="sub-section">
                <div class="sub-section-title">Testimonial 1</div>
                <div class="testimonial-fields">
                  <div class="editable-field">
                    <div class="field-label">Name</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_1_name'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_1_name')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Location</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_1_location'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_1_location')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field rating-field">
                    <div class="field-label">Rating</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_1_rating'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_1_rating')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Quote</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_1_quote'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_1_quote')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Testimonial 2 -->
              <div class="sub-section">
                <div class="sub-section-title">Testimonial 2</div>
                <div class="testimonial-fields">
                  <div class="editable-field">
                    <div class="field-label">Name</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_2_name'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_2_name')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Location</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_2_location'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_2_location')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field rating-field">
                    <div class="field-label">Rating</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_2_rating'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_2_rating')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Quote</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_2_quote'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_2_quote')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Testimonial 3 -->
              <div class="sub-section">
                <div class="sub-section-title">Testimonial 3</div>
                <div class="testimonial-fields">
                  <div class="editable-field">
                    <div class="field-label">Name</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_3_name'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_3_name')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field">
                    <div class="field-label">Location</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_3_location'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_3_location')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field rating-field">
                    <div class="field-label">Rating</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_3_rating'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_3_rating')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                  <div class="editable-field full-width">
                    <div class="field-label">Quote</div>
                    <div
                      contenteditable
                      class="editable-text"
                      :data-key="'testimonial_3_quote'"
                      @blur="handleContentChange"
                      @input="handleInput"
                    :data-placeholder="getPlaceholder('testimonial_3_quote')"
                    @focus="handleFocus"
                      
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Footer Section -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <span class="panel-title-text">Footer Section</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="editable-content-group two-column">
              <div class="editable-field">
                <div class="field-label">CTA Title</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'footer_cta_title'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('footer_cta_title')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              <div class="editable-field">
                <div class="field-label">CTA Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'footer_cta_description'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('footer_cta_description')"
                  @focus="handleFocus"
                  
                ></div>
              </div>
              <div class="editable-field full-width">
                <div class="field-label">About Description</div>
                <div
                  contenteditable
                  class="editable-text"
                  :data-key="'footer_about_description'"
                  @blur="handleContentChange"
                  @input="handleInput"
                  :data-placeholder="getPlaceholder('footer_about_description')"
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
      Home page content updated successfully!
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
  getHomePageContent,
  bulkUpdateHomePageContent,
} from '@/api/admin.api'
import type { HomePageContentMap, HomePageSectionModel } from '@/models/home-page-content.model'

// Section definitions for placeholder lookup
const sectionDefinitions: Record<string, { placeholder: string }> = {
  search_title: { placeholder: 'Find Your Perfect Vehicle at Bilskyen' },
  search_description: { placeholder: 'Search our inventory to find the perfect match for your needs.' },
  hero_description: { placeholder: 'Revolutionizing the car buying experience with transparent pricing, quality vehicles, and exceptional customer service.' },
  featured_vehicles_title: { placeholder: 'Featured Vehicles' },
  featured_vehicles_description: { placeholder: 'Explore our selection of quality vehicles ready for you to drive home today.' },
  stats_title: { placeholder: 'Why Choose Bilskyen' },
  stats_description: { placeholder: "We're committed to providing exceptional service and quality vehicles to our customers." },
  features_title: { placeholder: 'Our Services' },
  features_description: { placeholder: 'We provide comprehensive services to make your vehicle purchase smooth and enjoyable.' },
  testimonials_title: { placeholder: 'Customer Testimonials' },
  testimonials_description: { placeholder: 'Hear what our customers have to say about their experience with us.' },
  footer_cta_title: { placeholder: 'Ready to Find Your Next Vehicle?' },
  footer_cta_description: { placeholder: 'Visit our showroom or browse our inventory online. Our team is ready to help you find the perfect vehicle that fits your needs and budget.' },
  footer_about_description: { placeholder: 'Bilskyen - Driving trust and value with quality pre-owned vehicles for every journey.' },
  stat_1_value: { placeholder: '100+' },
  stat_1_title: { placeholder: 'Quality Vehicles' },
  stat_1_description: { placeholder: 'Thoroughly inspected vehicles in our inventory' },
  stat_2_value: { placeholder: '500+' },
  stat_2_title: { placeholder: 'Happy Customers' },
  stat_2_description: { placeholder: 'Satisfied customers who found their perfect vehicle' },
  stat_3_value: { placeholder: '15+' },
  stat_3_title: { placeholder: 'Years of Experience' },
  stat_3_description: { placeholder: 'Years serving our community with integrity' },
  stat_4_value: { placeholder: '98%' },
  stat_4_title: { placeholder: 'Satisfaction Rate' },
  stat_4_description: { placeholder: 'Customer satisfaction based on reviews' },
  feature_1_title: { placeholder: 'Financing Options' },
  feature_1_description: { placeholder: 'We work with multiple lenders to find the best financing solutions for your budget.' },
  feature_2_title: { placeholder: 'Vehicle Warranty' },
  feature_2_description: { placeholder: 'Extended warranty options to protect your investment and give you peace of mind.' },
  feature_3_title: { placeholder: 'Service Department' },
  feature_3_description: { placeholder: 'Professional maintenance and repair services to keep your vehicle in top condition.' },
  testimonial_1_name: { placeholder: 'John Davis' },
  testimonial_1_location: { placeholder: 'Copenhagen, Denmark' },
  testimonial_1_quote: { placeholder: 'The team at Bilskyen made buying a car so easy. They were transparent about pricing and helped me find the perfect vehicle for my family.' },
  testimonial_1_rating: { placeholder: '5' },
  testimonial_2_name: { placeholder: 'Priya Sharma' },
  testimonial_2_location: { placeholder: 'Aarhus, Denmark' },
  testimonial_2_quote: { placeholder: 'I was impressed with their knowledge and no-pressure approach. I got a great deal on my new car and would definitely recommend them.' },
  testimonial_2_rating: { placeholder: '5' },
  testimonial_3_name: { placeholder: 'Ahmed Khan' },
  testimonial_3_location: { placeholder: 'Odense, Denmark' },
  testimonial_3_quote: { placeholder: 'The financing options they provided were better than I expected. The entire process was smooth and I drove away very happy.' },
  testimonial_3_rating: { placeholder: '4' },
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
const formData = reactive<HomePageContentMap>({})

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
 * Get display value for a field
 */
function getDisplayValue(key: string): string {
  const value = formData[key]
  return value && value.trim() ? value : ''
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
 * Load home page content
 */
async function loadContent() {
  loading.value = true
  error.value = null

  try {
    const data = await getHomePageContent('home')
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
    error.value = err.message || 'Failed to load home page content'
    console.error('Error loading home page content:', err)
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
    const sectionsToUpdate: HomePageContentMap = {}
    
    Object.keys(sectionDefinitions).forEach((key) => {
      const value = formData[key]
      // Include if it has a value or if it exists in the database
      if (value !== undefined && value !== null) {
        sectionsToUpdate[key] = value || null
      }
    })

    const updatedSections = await bulkUpdateHomePageContent(sectionsToUpdate, 'home')
    
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
    errorMessage.value = err.message || 'Failed to save home page content'
    showError.value = true
    console.error('Error saving home page content:', err)
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
.home-page-content-container {
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

/* Remove border radius from expanded panels */
.expansion-panels :deep(.v-expansion-panel--active) {
  border-radius: 0 !important;
}

/* First expanded panel - remove bottom border radius */
.expansion-panels :deep(.v-expansion-panel--active:first-child) {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

/* Last expanded panel - remove top border radius */
.expansion-panels :deep(.v-expansion-panel--active:last-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* Middle expanded panels - no border radius */
.expansion-panels :deep(.v-expansion-panel--active:not(:first-child):not(:last-child)) {
  border-radius: 0 !important;
}

/* Remove bottom border radius from panel above an expanded panel */
.expansion-panels :deep(.v-expansion-panel--active + .v-expansion-panel) {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

/* Remove top border radius from panel below an expanded panel */
.expansion-panels :deep(.v-expansion-panel:has(+ .v-expansion-panel--active)) {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

/* Add bottom border to expanded panels to show section end */
.expansion-panels :deep(.v-expansion-panel--active .v-expansion-panel-text__wrapper) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Alternating background colors for expanded panels to distinguish sections */
.expansion-panels :deep(.v-expansion-panel.expanded-odd) {
  background-color: #ffffff !important;
}

.expansion-panels :deep(.v-expansion-panel.expanded-even) {
  background-color: #f8f9fa !important;
}

/* Apply background to the text wrapper and title for consistency */
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

/* Two-column layout for title + description pairs */
.editable-content-group.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0;
}

/* Add visual separator between columns */
.editable-content-group.two-column > .editable-field:first-child {
  padding-right: 10px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.editable-content-group.two-column > .editable-field:nth-child(2) {
  padding-left: 10px;
}

/* Responsive: stack on smaller screens */
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

/* Full width field (spans both columns) */
.editable-field.full-width {
  grid-column: 1 / -1;
  padding-left: 0 !important;
  padding-right: 0 !important;
  border: none !important;
}

/* Sub-section with grid layout for stats/features */
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

/* Testimonials: Name + Location side by side, Rating small, Quote full width */
.testimonial-fields {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  padding: 0;
}

.testimonial-fields > .editable-field:first-child {
  padding-right: 10px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.testimonial-fields > .editable-field:nth-child(2) {
  padding-left: 10px;
  padding-right: 10px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.testimonial-fields > .editable-field:nth-child(3) {
  padding-left: 10px;
}

.testimonial-fields .editable-field.full-width {
  grid-column: 1 / -1;
  padding-left: 0 !important;
  padding-right: 0 !important;
  border: none !important;
}

.testimonial-fields .editable-field.rating-field {
  grid-column: auto;
  min-width: 80px;
}

@media (max-width: 768px) {
  .sub-section .editable-content-group,
  .testimonial-fields {
    grid-template-columns: 1fr;
  }
  
  .sub-section .editable-content-group > .editable-field:first-child,
  .testimonial-fields > .editable-field:first-child,
  .testimonial-fields > .editable-field:nth-child(2) {
    padding-right: 0;
    padding-left: 0;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding-bottom: 12px;
    margin-bottom: 0;
  }
  
  .sub-section .editable-content-group > .editable-field:nth-child(2),
  .testimonial-fields > .editable-field:nth-child(3) {
    padding-left: 0;
    padding-top: 12px;
  }
  
  .testimonial-fields .editable-field.rating-field {
    grid-column: 1 / -1;
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

/* Remove default Vuetify expansion panel styling */
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
