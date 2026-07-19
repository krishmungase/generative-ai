import { graph } from '../graph.js'

/**
 * POST /api/chat
 * Body: { messages: [{ role, content }], threadId?: string }
 * Returns the last AI message content from the graph.
 */
export const chat = async (req, res, next) => {
    try {
        const { messages, threadId = 'default-session' } = req.body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'messages array is required and must not be empty',
            })
        }

        const config = {
            streamMode: 'updates',
            configurable: { thread_id: threadId },
        }

        const stream = await graph.stream({ messages }, config)

        let finalState = null

        for await (const chunk of stream) {
            const [, content] = Object.entries(chunk)[0]
            finalState = content
        }

        const lastMsg = finalState?.messages?.at(-1)

        if (!lastMsg) {
            return res.status(500).json({
                success: false,
                message: 'No response generated from the AI graph',
            })
        }

        return res.status(200).json({
            success: true,
            role: 'assistant',
            content: lastMsg.content,
        })
    } catch (err) {
        next(err)
    }
}
