import { Router } from 'express'
import { chat } from '../controllers/chat.controller.js'

const router = Router()

/**
 * POST /api/chat
 * Send a message to the AI expense assistant.
 */
router.post('/', chat)

export default router
