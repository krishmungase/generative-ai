import { config } from 'dotenv'
config()

const {
    GROQ_API_KEY,
    TAVILY_API_KEY,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    WEATHER_KEY,
    DB_URL,
    PORT,
    CLIENT_URL,
} = process.env

const ENV = {
    GROQ_API_KEY,
    TAVILY_API_KEY,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    WEATHER_KEY,
    DB_URL,
    PORT,
    CLIENT_URL,
}

export default ENV