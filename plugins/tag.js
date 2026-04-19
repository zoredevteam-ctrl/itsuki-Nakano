/**
 * TAG - ITSUKI NAKANO
 * Menciona a todos los miembros del grupo
 * Comandos: #tag, #everyone, #todos
 * Solo admins y owners
 * Z0RT SYSTEMS 🌸
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) {
        return conn.sendMessage(m.chat, {
            text: '🌸 Este comando solo funciona en grupos~'
        }, { quoted: m })
    }

    await m.react('⏳')

    try {
        const meta    = await conn.groupMetadata(m.chat)
        const members = meta.participants.map(p => p.id)
        const nombre  = meta.subject || 'el grupo'
        const msg     = (text || '').trim() || '¡Atención a todos! 🌸'

        // Construir menciones en bloques de 50 (límite de WhatsApp)
        const CHUNK = 50
        const chunks = []
        for (let i = 0; i < members.length; i += CHUNK) {
            chunks.push(members.slice(i, i + CHUNK))
        }

        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(
            thumb,
            `📢 ${global.botName || 'Itsuki Nakano'}`,
            nombre
        )

        for (let i = 0; i < chunks.length; i++) {
            const chunk   = chunks[i]
            const esPrimero = i === 0

            const menciones = chunk.map(jid => `@${jid.split('@')[0]}`).join(' ')

            const caption = esPrimero
                ? `╔════ ❀ 𝐓𝐀𝐆 𝐆𝐑𝐔𝐏𝐎 ❀ ════╗\n\n` +
                  `📢 *${msg}*\n\n` +
                  `👥 *Grupo:* ${nombre}\n` +
                  `🌸 *Miembros:* ${members.length}\n\n` +
                  menciones + '\n\n' +
                  `╚════ ❀ 🌷 ❀ ════╝`
                : menciones

            await conn.sendMessage(m.chat, {
                text:     caption,
                mentions: chunk,
                contextInfo: esPrimero ? ctx : undefined
            }, { quoted: m })

            // Pequeña pausa entre bloques para evitar spam block
            if (i < chunks.length - 1) {
                await new Promise(r => setTimeout(r, 1000))
            }
        }

        await m.react('✅')

    } catch (e) {
        console.error('[TAG ERROR]', e.message)
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `❌ Error al tagear: ${e.message}`
        }, { quoted: m })
    }
}

handler.command  = ['tag', 'everyone', 'todos', 'tagall']
handler.group    = true
handler.admin    = true
export default handler