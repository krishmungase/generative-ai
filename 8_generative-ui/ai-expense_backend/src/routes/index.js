import { Router } from 'express'
import chatRoutes from './chat.routes.js'

const router = Router()

/** Health check */
router.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'AI Expense API is running' })
})

/** Feature routes */
router.use('/chat', chatRoutes)

export default router
