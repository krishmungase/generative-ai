import { useMutation } from '@tanstack/react-query'
import apis from './apis'

/**
 * Hook to send a message to the AI expense assistant.
 * Returns { sendMessage, isLoading }
 *
 * @param {{ onSuccess: (data) => void, onError?: (err) => void }} callbacks
 */
const useSendMessage = ({ onSuccess, onError } = {}) => {
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.sendMessage({ data }),
    onSuccess: ({ data: response }) => {
      onSuccess?.(response)
    },
    onError: (err) => {
      onError?.(err)
    },
    retry: false,
  })

  return { sendMessage: mutate, isLoading: isPending }
}

export default useSendMessage
