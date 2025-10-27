<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Beispiele</template>

    <div class="examples" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;">
      <div class="product-card" style="background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);border-radius:12px;padding:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:transform 0.2s;">
        <div class="product-icon" style="display:flex;justify-content:center;margin-bottom:0.5rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4caf50"/>
          </svg>
        </div>
        <h4 style="margin:0 0 0.25rem 0;font-size:1.1rem;font-weight:600;color:#333;">Wurst</h4>
        <p style="margin:0;font-size:0.9rem;color:#666;">Ablaufdatum: 15.11.2025</p>
      </div>

      <div class="product-card" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:12px;padding:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:transform 0.2s;">
        <div class="product-icon" style="display:flex;justify-content:center;margin-bottom:0.5rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ff9800"/>
          </svg>
        </div>
        <h4 style="margin:0 0 0.25rem 0;font-size:1.1rem;font-weight:600;color:#333;">Käse</h4>
        <p style="margin:0;font-size:0.9rem;color:#666;">Ablaufdatum: 30.12.2025</p>
      </div>

      <div class="product-card" style="background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);border-radius:12px;padding:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:transform 0.2s;">
        <div class="product-icon" style="display:flex;justify-content:center;margin-bottom:0.5rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 5L9 17l-4-4 1.41-1.41L9 14.17l6.59-6.59L17 7z" fill="#2196f3"/>
          </svg>
        </div>
        <h4 style="margin:0 0 0.25rem 0;font-size:1.1rem;font-weight:600;color:#333;">Brot</h4>
        <p style="margin:0;font-size:0.9rem;color:#666;">Ablaufdatum: 10.01.2026</p>
      </div>

      <div class="product-card" style="background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);border-radius:12px;padding:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:transform 0.2s;">
        <div class="product-icon" style="display:flex;justify-content:center;margin-bottom:0.5rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#8bc34a"/>
          </svg>
        </div>
        <h4 style="margin:0 0 0.25rem 0;font-size:1.1rem;font-weight:600;color:#333;">Milch</h4>
        <p style="margin:0;font-size:0.9rem;color:#666;">Ablaufdatum: 05.02.2026</p>
      </div>

      <div class="product-card" style="background:linear-gradient(135deg,#fa709a 0%,#fee140 100%);border-radius:12px;padding:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:transform 0.2s;">
        <div class="product-icon" style="display:flex;justify-content:center;margin-bottom:0.5rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#e91e63"/>
          </svg>
        </div>
        <h4 style="margin:0 0 0.25rem 0;font-size:1.1rem;font-weight:600;color:#333;">Obst</h4>
        <p style="margin:0;font-size:0.9rem;color:#666;">Ablaufdatum: 20.03.2026</p>
      </div>

      <div class="product-card" style="background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);border-radius:12px;padding:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:transform 0.2s;">
        <div class="product-icon" style="display:flex;justify-content:center;margin-bottom:0.5rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#9c27b0"/>
          </svg>
        </div>
        <h4 style="margin:0 0 0.25rem 0;font-size:1.1rem;font-weight:600;color:#333;">Gemüse</h4>
        <p style="margin:0;font-size:0.9rem;color:#666;">Ablaufdatum: 15.04.2026</p>
      </div>
    </div>
  </WelcomeItem>
</template>
