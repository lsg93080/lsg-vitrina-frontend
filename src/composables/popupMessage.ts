import { ref } from 'vue'

export function usePopupMessage() {
  const message = ref<{ text: string; severity: string } | undefined>()
  const showMessage = ref(false)

  const setMessage = (text: string, severity: 'success' | 'error') => {
    message.value = { text, severity }
    showMessage.value = true
  }

  const reset = () => {
    message.value = undefined
    showMessage.value = false
  }

  return { message, showMessage, setMessage, reset }
}
