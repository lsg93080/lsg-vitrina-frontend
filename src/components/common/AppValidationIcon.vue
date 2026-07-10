<template>
  <div class="validation-icon">
    <font-awesome-icon
      class="icon"
      :class="props.success === true ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'"
      :icon="icon"
      ><div class="background"></div
    ></font-awesome-icon>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'

const props = defineProps({
  success: {
    type: Boolean,
    default: false,
    required: true
  }
})

const { success } = toRefs(props)
const icon = ref(success.value ? 'circle-check' : 'circle-xmark')

watch(success, (newSuccess) => {
  icon.value = newSuccess ? 'circle-check' : 'circle-xmark'
})
</script>
<style scoped>
.validation-icon {
  width: 16px;
  height: 16px;
  position: relative;
}

.icon {
  z-index: 1;
  position: absolute;
  inset: 0;
  margin: auto;
}
.validation-icon::after {
  content: '';
  width: 10px;
  height: 10px;
  background-color: white;
  z-index: 0;
  position: absolute;
  border-radius: 50%;
  inset: 0;
  margin: auto;
}
</style>
