/**
 * Global error handler middleware.
 * Catches any error passed via next(err) and returns a structured JSON response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    console.error('[Error]', err?.message || err)

    const statusCode = err?.statusCode ?? 500
    const message = err?.message ?? 'Internal Server Error'

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err?.stack }),
    })
}

export default errorHandler
