export default {
    command: ['ping', 'p'],
    tags: ['info'],
    help: ['ping', 'p'],
    desc: 'Muestra la latencia del bot',

    run: async (m, { conn, usedPrefix, command, isOwner }) => {
        const start = Date.now()
        const latency = Date.now() - start

        const pingText = `乂 *PING - ITSUKI NAKANO* 乂

*Latencia:* ${latency} ms
*Ping WS:* ${conn?.ws?.ping ?? 'N/A'} ms

¡Todo listo para ti, ${isOwner ? 'dueño ❤️' : 'amigo'}! 🍀`

        await m.reply(pingText)
    }
}