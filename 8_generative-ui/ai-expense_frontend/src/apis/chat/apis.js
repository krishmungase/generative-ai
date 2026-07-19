import { REQUEST_METHOD } from '@/constants'
import axios from 'axios'

/* Direct axios instance pointing at the AI backend (port 8000) */
const aiAxios = axios.create({
  baseURL: import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8000',
})

const urls = {
  chat: '/api/chat',
}

const apis = {
  /**
   * @param {{ messages: {role: string, content: string}[], threadId?: string }} data
   */
  sendMessage: ({ data }) =>
    aiAxios({
      url: urls.chat,
      method: REQUEST_METHOD.POST,
      data,
      headers: { 'Content-Type': 'application/json' },
    }),
}

export default apis
