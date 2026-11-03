export const getPaymentErrorMessage = (error, fallback = 'Unable to start payment.') => {
  const status = Number(error?.response?.status || 0)
  const responseData = error?.response?.data || {}

  if (status === 422) {
    const validationMessages = Object.values(responseData.errors || {})
      .flat()
      .filter((message) => typeof message === 'string' && message.trim())
    if (validationMessages.length) return validationMessages[0]
    return 'The payment request could not be processed. Please check the amount and try again.'
  }

  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status >= 500) return 'Automatic payment is temporarily unavailable. Please try again later.'
  if (!error?.response) return 'Unable to reach the payment service. Check your internet connection and try again.'

  return fallback
}

