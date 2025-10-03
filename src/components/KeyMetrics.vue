<template>
  <div class="metrics-container">
    <div class="column">
      <h3 class="column-title highlights-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        关键亮点
      </h3>
      <ul class="metrics-list">
        <li v-for="(item, index) in metricsData.highlights" :key="'h-' + index" class="metric-item">
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="column">
      <h3 class="column-title risks-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        风险提示
      </h3>
      <ul class="metrics-list">
        <li v-for="(item, index) in metricsData.risks" :key="'r-' + index" class="metric-item">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  metricsData: {
    type: Object,
    required: true,
    default: () => ({
      highlights: [],
      risks: []
    })
  }
});
</script>

<style scoped>
.metrics-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  padding: 1rem;
  gap: 2rem;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.column-title {
  font-size: 1.5rem;
  font-weight: 600;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.highlights-title {
  color: #26a69a; /* Teal */
  border-bottom: 2px solid #26a69a;
}

.risks-title {
  color: #ef5350; /* Red */
  border-bottom: 2px solid #ef5350;
}

.column-title svg {
  width: 24px;
  height: 24px;
}

.metrics-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.metric-item {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 5px;
  font-size: 1rem;
  line-height: 1.6;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.highlights-title + .metrics-list .metric-item {
  border-left-color: #26a69a;
}

.risks-title + .metrics-list .metric-item {
  border-left-color: #ef5350;
}

.metric-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}
</style>