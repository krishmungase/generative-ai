import mongoose from 'mongoose'
import { ENV } from '../config/index.js'

export const connectDB = async () => {
    const DB_URL = ENV.DB_URL
    if (!DB_URL) throw Error('DB URL not specified')
    await mongoose.connect(DB_URL)
}