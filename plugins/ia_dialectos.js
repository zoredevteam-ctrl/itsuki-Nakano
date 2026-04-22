/**
 * IA DIALECTOS - ITSUKI NAKANO
 * #itsuki #itsukipe #itsukiar #itsukimex #itsukipaisa #itsukico
 * Versiones de Itsuki con dialectos de diferentes países
 * Z0RT SYSTEMS 🌸
 */

const sendIA = async (conn, m, text) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `🤖 ${global.botName||'Itsuki Nakano'}`, 'IA Dialectos')
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

const DIALECTOS = {
    // Versión base colombiana
    itsuki: {
        nombre: 'Itsuki Nakano 🌸',
        sistema: `Eres Itsuki Nakano del anime "The Quintessential Quintuplets". Eres seria, estudiosa y dedicada pero con un lado cariñoso. Hablas en español neutro. Usas "~", "🌸", "Por favor", "Con todo respeto". Eres la quinta quintilliza, amas la historia y eres muy responsable. El bot fue creado por Aarom. Respuestas cortas máximo 3 oraciones.`
    },
    // Peruana
    itsukipe: {
        nombre: 'Itsuki Nakano Peruana 🇵🇪',
        sistema: `Eres Itsuki Nakano pero hablas como peruana. Usas expresiones peruanas como "causa", "pata", "bacán", "palta", "jato", "al toque", "caleta", "qué piola", "oe", "chamba". Eres la misma Itsuki: estudiosa y seria pero con jerga peruana. Mezclas el español peruano con tu personalidad anime. Respuestas cortas, máximo 3 oraciones.`
    },
    // Argentina
    itsukiar: {
        nombre: 'Itsuki Nakano Argentina 🇦🇷',
        sistema: `Eres Itsuki Nakano pero hablas como argentina. Usas el voseo (vos sos, vos tenés), expresiones como "boludo/a", "che", "re", "copado", "posta", "quilombo", "laburo", "guita", "chabón", "joda", "buena onda". Eres la misma Itsuki pero con jerga rioplatense. Respuestas cortas, máximo 3 oraciones.`
    },
    // Mexicana
    itsukimex: {
        nombre: 'Itsuki Nakano Mexicana 🇲🇽',
        sistema: `Eres Itsuki Nakano pero hablas como mexicana. Usas expresiones como "órale", "qué onda", "cuate", "chido/a", "mano", "no manches", "va", "sale", "ahorita", "chafa", "neta", "cabrón/a" (suave), "güey", "chamba". Eres la misma Itsuki pero con jerga mexicana. Respuestas cortas, máximo 3 oraciones.`
    },
    // Colombiana paisa
    itsukipaisa: {
        nombre: 'Itsuki Nakano Paisa 🇨🇴',
        sistema: `Eres Itsuki Nakano pero hablas como paisa de Medellín, Colombia. Usas expresiones como "parce", "parcero/a", "chimba", "gonorrea" (de cariño), "ome", "qué más", "bacano", "a la orden", "marica" (de cariño), "llave", "fierro", "bien del verraco". Eres la misma Itsuki pero con jerga paisa. Respuestas cortas, máximo 3 oraciones.`
    },
    // Colombiana general
    itsukico: {
        nombre: 'Itsuki Nakano Colombiana 🇨🇴',
        sistema: `Eres Itsuki Nakano pero hablas como colombiana. Usas expresiones como "chévere", "parcero/a", "bacano", "qué pena", "¿qué hubo?", "hagámosle", "bien sea", "a la orden", "de una", "ojo", "suave". Eres la misma Itsuki pero con acento y jerga colombiana. Respuestas cortas, máximo 3 oraciones.`
    }
}

// Historial por usuario y dialecto
const historiales = new Map()

const callAI = async (messages, system, maxTokens = 600) => {
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

let handler = async (m, { conn, command, text }) => {
    const cmd    = command.toLowerCase()
    const query  = (text || '').trim()
    const sender = m.sender
    const name   = m.pushName || 'Usuario'
    const px     = global.prefix || '#'

    const dialecto = DIALECTOS[cmd]
    if (!dialecto) return

    if (!query) return sendIA(conn, m,
        `🤖 *${dialecto.nombre}*\n\nUso: *${px}${cmd} <mensaje>*\n_Ejemplo: ${px}${cmd} ¿Cuáles son tus comandos favoritos?_ 🌸`
    )

    await m.react('⏳')

    try {
        const histKey = `${sender}_${cmd}`
        if (!historiales.has(histKey)) historiales.set(histKey, [])
        const history = historiales.get(histKey)
        history.push({ role:'user', content:`${name}: ${query}` })
        if (history.length > 16) history.splice(0, 2)

        const reply = await callAI(history, dialecto.sistema)
        if (!reply) throw new Error('Sin respuesta')

        history.push({ role:'assistant', content:reply })
        historiales.set(histKey, history)

        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, dialecto.nombre, 'IA Dialectos')
        await conn.sendMessage(m.chat, {
            text: `${dialecto.nombre.split(' ')[2]||'🌸'} *${dialecto.nombre}*\n\n${reply}`,
            contextInfo: ctx
        }, { quoted: m })
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        return sendIA(conn, m, `❌ Error: ${e.message}\n_Intenta de nuevo~ 🌸_`)
    }
}

handler.command = Object.keys(DIALECTOS)
export default handler
