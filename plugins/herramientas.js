/**
 * HERRAMIENTAS - ITSUKI NAKANO
 * #clima #traducir #calc #qr #wiki #chiste #frase
 * Z0RT SYSTEMS 🌸
 */

const sendTool = async (conn, m, text, isError = false) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        (isError ? '❌ ' : '🛠️ ') + (global.botName || 'Itsuki Nakano'),
        'Herramientas'
    )
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

const apiGet = async (url, timeout = 15000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
    } finally { clearTimeout(timer) }
}

let handler = async (m, { conn, command, text, args }) => {
    const cmd   = command.toLowerCase()
    const query = (text || '').trim()
    const px    = global.prefix || '#'

    // ── CALC ──────────────────────────────────────────────────────────────────
    if (cmd === 'calc' || cmd === 'calcular') {
        if (!query) return sendTool(conn, m, `🔢 *CALCULADORA*\n\nUso: *${px}calc <expresión>*\n_Ejemplo: ${px}calc 25 * 4 + 10_`)
        try {
            // Sanitize - solo permitir operaciones matemáticas básicas
            const sanitized = query.replace(/[^0-9+\-*/().%\s]/g, '')
            if (!sanitized) return sendTool(conn, m, '❌ Expresión inválida', true)
            const result = Function(`"use strict"; return (${sanitized})`)()
            return sendTool(conn, m,
                `🔢 *CALCULADORA*\n\n` +
                `📝 Expresión: \`${query}\`\n` +
                `✅ Resultado: *${result}*\n\n` +
                `_¡Matemáticas resueltas~ 🌸_`
            )
        } catch { return sendTool(conn, m, `❌ Expresión inválida: \`${query}\`\n_Usa operadores básicos: + - * / ()_`, true) }
    }

    // ── QR ────────────────────────────────────────────────────────────────────
    if (cmd === 'qr') {
        if (!query) return sendTool(conn, m, `📷 *QR GENERATOR*\n\nUso: *${px}qr <texto o link>*\n_Ejemplo: ${px}qr https://github.com_`)
        await m.react('⏳')
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(query)}&bgcolor=ffffff&color=000000&format=png`
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `📷 ${global.botName||'Itsuki Nakano'}`, 'QR Generator')
        await conn.sendMessage(m.chat, {
            image: { url: qrUrl },
            caption: `📷 *QR GENERADO*\n\n📝 Contenido: \`${query.slice(0, 80)}${query.length > 80 ? '...' : ''}\`\n\n_¡Escanéalo con tu cámara~ 🌸_`,
            contextInfo: ctx
        }, { quoted: m })
        await m.react('✅')
        return
    }

    // ── CLIMA ─────────────────────────────────────────────────────────────────
    if (cmd === 'clima' || cmd === 'weather') {
        if (!query) return sendTool(conn, m, `🌤️ *CLIMA*\n\nUso: *${px}clima <ciudad>*\n_Ejemplo: ${px}clima Bogotá_`)
        await m.react('⏳')
        try {
            const r = await apiGet(`https://wttr.in/${encodeURIComponent(query)}?format=j1`)
            const c = r.current_condition?.[0]
            const a = r.nearest_area?.[0]
            if (!c) throw new Error('Ciudad no encontrada')
            const ciudad    = a?.areaName?.[0]?.value || query
            const pais      = a?.country?.[0]?.value || ''
            const temp      = c.temp_C + '°C'
            const sensacion = c.FeelsLikeC + '°C'
            const humedad   = c.humidity + '%'
            const viento    = c.windspeedKmph + ' km/h'
            const desc      = c.weatherDesc?.[0]?.value || 'N/A'

            return sendTool(conn, m,
                `🌤️ *CLIMA — ${ciudad.toUpperCase()}${pais ? `, ${pais}` : ''}*\n\n` +
                `🌡️ Temperatura: *${temp}*\n` +
                `🥵 Sensación: *${sensacion}*\n` +
                `💧 Humedad: *${humedad}*\n` +
                `💨 Viento: *${viento}*\n` +
                `☁️ Condición: *${desc}*\n\n` +
                `_Datos actualizados~ 🌸_`
            )
        } catch (e) {
            await m.react('❌')
            return sendTool(conn, m, `❌ No encontré el clima de *${query}*\n_Verifica el nombre de la ciudad_ 🌸`, true)
        }
    }

    // ── TRADUCIR ──────────────────────────────────────────────────────────────
    if (cmd === 'traducir' || cmd === 'translate') {
        if (!query) return sendTool(conn, m,
            `🌐 *TRADUCTOR*\n\nUso: *${px}traducir <idioma> <texto>*\n\n` +
            `_Idiomas: en (inglés), es (español), pt (portugués), fr (francés), de (alemán), ja (japonés), ko (coreano), zh (chino)_\n\n` +
            `_Ejemplo: ${px}traducir en Hola mundo_`
        )
        const parts  = query.split(' ')
        const lang   = parts[0].toLowerCase()
        const texto  = parts.slice(1).join(' ')
        if (!texto) return sendTool(conn, m, `❌ Indica el texto a traducir\n_Ejemplo: ${px}traducir en Hola mundo_`, true)
        await m.react('⏳')
        try {
            const r = await apiGet(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=es|${lang}`)
            const traduccion = r?.responseData?.translatedText || r?.matches?.[0]?.translation
            if (!traduccion) throw new Error('Sin traducción')
            return sendTool(conn, m,
                `🌐 *TRADUCCIÓN*\n\n` +
                `📝 Original: _${texto}_\n` +
                `🗣️ Idioma: *${lang}*\n` +
                `✅ Traducción: *${traduccion}*\n\n` +
                `_Powered by MyMemory~ 🌸_`
            )
        } catch {
            await m.react('❌')
            return sendTool(conn, m, `❌ No pude traducir. Verifica el idioma y el texto~ 🌸`, true)
        }
    }

    // ── WIKI ──────────────────────────────────────────────────────────────────
    if (cmd === 'wiki' || cmd === 'wikipedia') {
        if (!query) return sendTool(conn, m, `📖 *WIKIPEDIA*\n\nUso: *${px}wiki <término>*\n_Ejemplo: ${px}wiki Tokio_`)
        await m.react('⏳')
        try {
            const r = await apiGet(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
            if (!r?.extract) throw new Error('No encontrado')
            const extract = r.extract.slice(0, 600) + (r.extract.length > 600 ? '...' : '')
            return sendTool(conn, m,
                `📖 *WIKIPEDIA — ${r.title}*\n\n` +
                `${extract}\n\n` +
                `🔗 ${r.content_urls?.desktop?.page || ''}\n\n` +
                `_Fuente: Wikipedia ES~ 🌸_`
            )
        } catch {
            await m.react('❌')
            return sendTool(conn, m, `❌ No encontré información sobre *${query}* en Wikipedia~ 🌸`, true)
        }
    }

    // ── CHISTE ────────────────────────────────────────────────────────────────
    if (cmd === 'chiste' || cmd === 'joke') {
        const chistes = [
            '¿Por qué los pájaros vuelan hacia el sur en invierno? Porque caminar sería demasiado lejos. 😂',
            '¿Qué le dice una iguana a su hermana gemela? Somos iguanas. 🦎',
            '¿Por qué el libro de matemáticas estaba triste? Porque tenía muchos problemas. 📚',
            '¿Qué hace una abeja en el gimnasio? ¡Zum-ba! 🐝',
            '¿Por qué el espantapájaros ganó un premio? Porque era sobresaliente en su campo. 🌾',
            '¿Qué le dice un jardinero a otro? ¡Mucho tiempo sin verte! 🌱',
            '¿Por qué las plantas no usan internet? Porque tienen miedo a los virus. 🌿',
            '¿Qué hace un pez cuando está aburrido? Nada. 🐟',
            '¿Cómo se dice "amigo" en japonés? No lo sé, pero te lo "diré". 😏',
            '¿Qué le dijo el océano a la playa? Nada, solo hizo olas. 🌊'
        ]
        return sendTool(conn, m,
            `😂 *CHISTE ITSUKI*\n\n` +
            chistes[Math.floor(Math.random() * chistes.length)] + '\n\n' +
            `_¡Espero haberte hecho sonreír~ 🌸_`
        )
    }

    // ── FRASE ─────────────────────────────────────────────────────────────────
    if (cmd === 'frase' || cmd === 'quote') {
        const frases = [
            '"El conocimiento es la única riqueza que no se puede robar." — Aristóteles 📚',
            '"El éxito es la suma de pequeños esfuerzos repetidos día tras día." — Robert Collier 💪',
            '"La educación es el arma más poderosa que puedes usar para cambiar el mundo." — Nelson Mandela 🌍',
            '"No llores porque terminó, sonríe porque sucedió." — Gabriel García Márquez 🌸',
            '"La vida es lo que pasa mientras estás ocupado haciendo otros planes." — John Lennon 🎵',
            '"El futuro pertenece a quienes creen en la belleza de sus sueños." — Eleanor Roosevelt ✨',
            '"Sé el cambio que quieres ver en el mundo." — Mahatma Gandhi 🕊️',
            '"La paciencia es amarga, pero su fruto es dulce." — Aristóteles 🌷',
            '"El único modo de hacer un gran trabajo es amar lo que haces." — Steve Jobs 💼',
            '"Con educación y dedicación, todo es posible." — Itsuki Nakano 🌸'
        ]
        return sendTool(conn, m,
            `✍️ *FRASE DEL DÍA*\n\n` +
            frases[Math.floor(Math.random() * frases.length)] + '\n\n' +
            `_Que esta frase inspire tu día~ 🌸_`
        )
    }
}

handler.command = ['calc','calcular','qr','clima','weather','traducir','translate','wiki','wikipedia','chiste','joke','frase','quote']
export default handler
