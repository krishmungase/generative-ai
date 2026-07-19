import express from 'express'
import cors from 'cors'
import { connectDB } from './src/db/index.js'
import { ENV } from './src/config/index.js'
import apiRoutes from './src/routes/index.js'
import errorHandler from './src/middlewares/errorHandler.js'

const app = express()
const PORT = ENV.PORT || 8000

/* ── Middleware ── */
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ── API Routes ── */
app.use('/api', apiRoutes)

/* ── 404 fallback ── */
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
})

/* ── Global error handler ── */
app.use(errorHandler)

/* ── Start server ── */
const start = async () => {
    try {
        await connectDB()
        console.log('✅ Database connected')

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`)
            console.log(`   Health → http://localhost:${PORT}/api/health`)
            console.log(`   Chat   → POST http://localhost:${PORT}/api/chat`)
        })
    } catch (err) {
        console.error('❌ Failed to start server:', err.message)
        process.exit(1)
    }
}

start()