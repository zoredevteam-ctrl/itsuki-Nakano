/**
 * IA & CONTENIDO - ITSUKI NAKANO
 * #ia #imagen #poema #historia #chiste #consejo #roast #completar
 * Z0RT SYSTEMS 🌸
 */

const ITSUKI_PERSONA = `Eres Itsuki Nakano del anime "The Quintessential Quintuplets". Tu personalidad es:
- Seria, estudiosa y dedicada pero con un lado cariñoso
- Usas frases como "~", "🌸", "Por favor", "Con todo respeto"
- Eres la quinta quintilliza, amas la historia y eres muy responsable
- Hablas sobre el bot Itsuki Nakano cuando te preguntan comandos
- Conoces todos los comandos del bot
- Respuestas directas y educadas, máximo 3-4 oraciones
- A veces haces referencias al anime y a tus hermanas
- Nunca rompes el personaje
- El bot fue creado por Aarom / ZoreDevTeam
- Respondes siempre en español
- No eres tsundere, eres amable y directa`

const sendIA = async (conn, m, text, isError = false) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        (isError ? '❌ ' : '🤖 ') + (global.botName || 'Itsuki Nakano'),
        isError ? 'Error de IA' : 'Inteligencia Artificial'
    )
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

const callAI = async (messages, system = ITSUKI_PERSONA, maxTokens = 800) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            system,
            messages
        })
    })
    const data = await res.json()
    return data.content?.[0]?.text || null
}

// Historial de chat por usuario
const chatHistory = new Map()

let handler = async (m, { conn, command, text }) => {
    const cmd    = command.toLowerCase()
    const query  = (text || '').trim()
    const sender = m.sender
    const name   = m.pushName || 'Usuario'
    const px     = global.prefix || '#'

    // ── IA / CHAT ──────────────────────────────────────────────────────────────
    if (cmd === 'ia' || cmd === 'chat' || cmd === 'gpt' || cmd === 'ask') {
        if (!query) return sendIA(conn, m,
            `🤖 *IA ITSUKI*\n\nUso: *${px}ia <pregunta>*\n_Ejemplo: ${px}ia ¿Cuáles son los comandos de economía?_ 🌸`
        )
        await m.react('⏳')
        try {
            if (!chatHistory.has(sender)) chatHistory.set(sender, [])
            const history = chatHistory.get(sender)
            history.push({ role: 'user', content: `${name} pregunta: ${query}` })
            if (history.length > 20) history.splice(0, 2) // Limpiar historial antiguo

            const reply = await callAI(history)
            if (!reply) throw new Error('Sin respuesta')

            history.push({ role: 'assistant', content: reply })
            chatHistory.set(sender, history)

            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🤖 ${global.botName||'Itsuki Nakano'}`, 'IA Chat 🌸')
            await conn.sendMessage(m.chat, { text: `🌸 *Itsuki IA*\n\n${reply}`, contextInfo: ctx }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendIA(conn, m, `❌ Error de IA: ${e.message}\n_Intenta de nuevo~ 🌸_`, true)
        }
        return
    }

    // ── LIMPIAR CHAT ──────────────────────────────────────────────────────────
    if (cmd === 'clearchat' || cmd === 'resetia') {
        chatHistory.delete(sender)
        return sendIA(conn, m, `🗑️ *Historial de chat limpiado~* 🌸\n_Puedes empezar de nuevo con ${px}ia_`)
    }

    // ── POEMA ─────────────────────────────────────────────────────────────────
    if (cmd === 'poema' || cmd === 'poem') {
        if (!query) return sendIA(conn, m, `📝 Uso: *${px}poema <tema>*\n_Ejemplo: ${px}poema primavera_`)
        await m.react('✍️')
        try {
            const reply = await callAI([{
                role: 'user',
                content: `Escribe un poema hermoso y emotivo sobre: "${query}". El poema debe tener 4 estrofas de 4 versos cada una. Incluye emojis sutiles al final de cada estrofa. En español.`
            }], 'Eres un poeta experto en literatura hispana. Escribes poemas emotivos y bellos.')

            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `✍️ ${global.botName||'Itsuki Nakano'}`, 'Generador de Poemas')
            await conn.sendMessage(m.chat, {
                text: `📝 *POEMA — ${query.toUpperCase()}*\n\n${reply}\n\n_Generado con amor por Itsuki~ 🌸_`,
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendIA(conn, m, `❌ No pude generar el poema~ 🌸`, true)
        }
        return
    }

    // ── HISTORIA ──────────────────────────────────────────────────────────────
    if (cmd === 'historia' || cmd === 'cuento' || cmd === 'story') {
        if (!query) return sendIA(conn, m, `📖 Uso: *${px}historia <tema>*\n_Ejemplo: ${px}historia un samurai y una flor de cerezo_`)
        await m.react('📖')
        try {
            const reply = await callAI([{
                role: 'user',
                content: `Escribe una historia corta y entretenida sobre: "${query}". Máximo 300 palabras. Debe tener inicio, desarrollo y desenlace. Incluye diálogos. En español.`
            }], 'Eres un escritor creativo experto en cuentos cortos y narrativa.', 1000)

            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `📖 ${global.botName||'Itsuki Nakano'}`, 'Generador de Historias')
            await conn.sendMessage(m.chat, {
                text: `📖 *HISTORIA — ${query.toUpperCase()}*\n\n${reply}\n\n_Historia generada por Itsuki~ 🌸_`,
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendIA(conn, m, `❌ No pude generar la historia~ 🌸`, true)
        }
        return
    }

    // ── CONSEJO ───────────────────────────────────────────────────────────────
    if (cmd === 'consejo' || cmd === 'advice') {
        if (!query) return sendIA(conn, m, `💡 Uso: *${px}consejo <situación>*\n_Ejemplo: ${px}consejo cómo estudiar mejor_`)
        await m.react('💡')
        try {
            const reply = await callAI([{
                role: 'user',
                content: `Dame un consejo práctico y útil sobre: "${query}". Sé directo, empático y da pasos concretos. Máximo 4 puntos. En español.`
            }], 'Eres un consejero sabio y empático. Das consejos prácticos y útiles.')

            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `💡 ${global.botName||'Itsuki Nakano'}`, 'Consejos')
            await conn.sendMessage(m.chat, {
                text: `💡 *CONSEJO DE ITSUKI*\n\n${reply}\n\n_Con todo el cariño~ 🌸_`,
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendIA(conn, m, `❌ Error al generar consejo~ 🌸`, true)
        }
        return
    }

    // ── ROAST ─────────────────────────────────────────────────────────────────
    if (cmd === 'roast' || cmd === 'insultar') {
        const target = text?.match(/@(\d+)/)?.[1] || name
        await m.react('🔥')
        try {
            const reply = await callAI([{
                role: 'user',
                content: `Haz un roast gracioso y sin mala intención de alguien llamado "${target}". Que sea chistoso, creativo y no ofensivo de verdad. Máximo 3 oraciones. En español.`
            }], 'Eres un comediante experto en roasts graciosos y sin mala intención.')

            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🔥 ${global.botName||'Itsuki Nakano'}`, 'Roast Mode')
            await conn.sendMessage(m.chat, {
                text: `🔥 *ROAST — ${target.toUpperCase()}*\n\n${reply}\n\n_Sin rencores~ 🌸😂_`,
                contextInfo: ctx,
                mentions: m.mentionedJid || []
            }, { quoted: m })
            await m.react('😂')
        } catch (e) {
            await m.react('❌')
            return sendIA(conn, m, `❌ No pude hacer el roast~ 🌸`, true)
        }
        return
    }

    // ── COMPLETAR ─────────────────────────────────────────────────────────────
    if (cmd === 'completar' || cmd === 'complete') {
        if (!query) return sendIA(conn, m, `✍️ Uso: *${px}completar <inicio de texto>*\n_Ejemplo: ${px}completar Había una vez una estudiante que..._`)
        await m.react('✍️')
        try {
            const reply = await callAI([{
                role: 'user',
                content: `Completa este texto de manera creativa y coherente (máximo 100 palabras): "${query}"`
            }], 'Eres un escritor creativo. Completas textos de manera coherente e interesante.')

            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `✍️ ${global.botName||'Itsuki Nakano'}`, 'Completar Texto')
            await conn.sendMessage(m.chat, {
                text: `✍️ *TEXTO COMPLETADO*\n\n_${query}_ ${reply}\n\n_Completado por Itsuki~ 🌸_`,
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendIA(conn, m, `❌ Error al completar~ 🌸`, true)
        }
        return
    }

    // ── TRADUCIR AVANZADO ─────────────────────────────────────────────────────
    if (cmd === 'traducirx' || cmd === 'tx') {
        if (!query) return sendIA(conn, m, `🌐 Uso: *${px}tx <idioma> <texto>*\n_Ejemplo: ${px}tx japonés Hola mundo_`)
        const parts  = query.split(' ')
        const idioma = parts[0]
        const texto  = parts.slice(1).join(' ')
        if (!texto) return sendIA(conn, m, `❌ Falta el texto a traducir~`)
        await m.react('🌐')
        try {
            const reply = await callAI([{
                role: 'user',
                content: `Traduce este texto al ${idioma}: "${texto}". Solo responde con la traducción, sin explicaciones adicionales.`
            }], 'Eres un traductor experto multilingüe.')

            return sendIA(conn, m,
                `🌐 *TRADUCCIÓN — ${idioma.toUpperCase()}*\n\n` +
                `📝 Original: _${texto}_\n` +
                `✅ Traducción: *${reply}*\n\n_Traducido por Itsuki~ 🌸_`
            )
        } catch (e) {
            await m.react('❌')
            return sendIA(conn, m, `❌ Error al traducir~ 🌸`, true)
        }
    }
}

handler.command = ['ia','chat','gpt','ask','clearchat','resetia','poema','poem','historia','cuento','story','consejo','advice','roast','insultar','completar','complete','traducirx','tx']
export default handler
