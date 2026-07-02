import { ref } from 'vue'

export type SnackbarColor = 'success' | 'error' | 'info' | 'warning'

export function useSnackbar() {
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success' as SnackbarColor,
  })

  const showSnackbar = (message: string, color: SnackbarColor = 'success') => {
    snackbar.value = {
      show: true,
      message,
      color,
    }
  }

  const showError = (message: string) => {
    showSnackbar(message, 'error')
  }

  return {
    snackbar,
    showSnackbar,
    showError,
  }
}
