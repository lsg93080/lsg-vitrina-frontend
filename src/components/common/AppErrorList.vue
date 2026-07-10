<template>
  <ul v-if="props.errors?.length > 0" class="form__error-list">
    <li v-for="error in props.errors" :key="error.$uid">
      {{ error.$message }}
    </li>
  </ul>
</template>
<script setup lang="ts">
import type { ErrorObject } from '@vuelidate/core'

const props = defineProps({
  errors: {
    type: Array<ErrorObject>,
    required: true
  }
})
</script>
<style scoped>
.form__error-list {
  color: var(--error-color);
  list-style-position: inside;
}

li {
  list-style: none;
  text-align: left;
}
</style>
