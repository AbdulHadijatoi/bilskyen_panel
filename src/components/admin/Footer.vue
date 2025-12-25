<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <p class="footer-copyright">
          © {{ currentYear }} {{ APP.NAME }}. All rights reserved.
        </p>
        <div class="footer-links">
          <router-link to="/privacy" class="footer-link">
            Privacy Policy
          </router-link>
          <router-link to="/terms" class="footer-link">
            Terms of Service
          </router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { APP } from '@/constants/app'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .footer {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
}

.footer-container {
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  .footer-container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--border);
  padding-top: 2rem;
  margin-top: 2rem;
}

.footer-copyright {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--muted-foreground);
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-link {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--muted-foreground);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--foreground);
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    gap: 0;
  }
  
  .footer-links {
    gap: 1rem;
  }
}
</style>

