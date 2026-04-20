export default {
    command: ['ping', 'p'],
    tags: ['info'],
    help: ['ping', 'p'],
    desc: 'Muestra la latencia del bot',

    run: async (m, { conn, isOwner }) => {
        // Calculamos la latencia comparando la hora del mensaje con la hora actual
        const timestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now()
        const latency = Math.abs(Date.now() - timestamp)

        const pingText = `👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖯𝖨𝖭𝖦 ─── 👑\n\n` +
                         `🌷 *Latencia del servidor:* \`${latency} ms\`\n` +
                         `> ✨ _Mi sistema se encuentra estable y listo para recibir sus órdenes${isOwner ? ', Aarom' : ''}._ 🌟`

        await conn.sendMessage(m.chat, {
            text: pingText,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99,
                externalAdReply: {
                    title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
                    body: 'Conexión Estable 🌟',
                    mediaType: 1,
                    thumbnailUrl: global.banner,
                    sourceUrl: global.rcanal
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
                    newsletterName: global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    }
}
