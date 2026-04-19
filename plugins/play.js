/**
 * PLAY - ITSUKI NAKANO 🌟
 * Descarga audio de YouTube
 * API: NexEvo (nex-magical.vercel.app)
 * Desarrollado por Aarom 👑
 */

const NEX_BASE = 'https://nex-magical.vercel.app'
const NEX_KEY  = 'NEX-D0E7E64C8F5E44E98F00D6B4'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const nexFetch = async (url, timeout = 25000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36',
                'Accept': 'application/json',
                'x-api-key': NEX_KEY
            }
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const raw = await res.text()
        const fixed = raw
            .replace(/\bverdadero\b/g, 'true')
            .replace(/\bfalso\b/g,     'false')
            .replace(/\bnulo\b/g,      'null')
        return JSON.parse(fixed)
    } finally {
        clearTimeout(timer)
    }
}

// ─── BÚSQUEDA YOUTUBE ─────────────────────────────────────────────────────────

const searchYoutube = async (query) => {
    try {
        const r = await nexFetch(`${NEX_BASE}/search/youtube?q=${encodeURIComponent(query)}&apikey=${NEX_KEY}`)
        if (r?.status && r?.result?.length) {
            // Preferir videos de más de 1 minuto (evitar shorts) para un buen estudio
            const filtered = r.result.filter(v => {
                const parts = (v.duration || '0:00').split(':')
                const secs  = parts.length >= 2
                    ? parseInt(parts[parts.length - 2] || 0) * 60 + parseInt(parts[parts.length - 1] || 0)
                    : 0
                return secs >= 60
            })
            const s = filtered[0] || r.result[0]
            console.log('[PLAY] OK NexEvo search:', s.title)
            return {
                title:    s.title    || query,
                url:      s.link     || '',
                author:   s.channel  || 'Desconocido',
                duration: s.duration || 'N/A',
                views:    'N/A',
                thumb:    s.imageUrl || ''
            }
        }
    } catch (e) { console.log('[PLAY] NexEvo search falló:', e.message) }
    return null
}

// ─── DESCARGA AUDIO ───────────────────────────────────────────────────────────

const getAudio = async (videoUrl) => {
    try {
        const encoded = encodeURIComponent(videoUrl)
        const r = await nexFetch(`${NEX_BASE}/download/audio?url=${encoded}&apikey=${NEX_KEY}`)
        console.log('[PLAY] NexEvo download response status:', r?.status, '| tiene url:', !!r?.result?.url)
        const link = r?.result?.url || r?.resultado?.url || null
        if (link && link.startsWith('http')) return link
        throw new Error('NexEvo no devolvió URL de descarga')
    } catch (e) {
        throw new Error('NexEvo falló: ' + e.message)
    }
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text }) => {
    const query = (text || '').trim()

    if (!query) {
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `🎵 ${global.botName}`, 'Módulo de Audio 🌺')
        return conn.sendMessage(m.chat, {
            text:
                `👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖬𝖴𝖲𝖨𝖢 ─── 👑\n\n` +
                `🌷 *Saludos.* ¿Qué melodía desea escuchar en esta ocasión?\n` +
                `> ✨ Por favor, indíqueme el nombre de la canción o el enlace de YouTube.\n\n` +
                `🌟 *Uso del Protocolo:*\n` +
                `› *${global.prefix}play* [nombre o enlace]\n\n` +
                `🌺 *Ejemplos de Búsqueda:*\n` +
                `› *${global.prefix}play* beethoven claro de luna\n` +
                `› *${global.prefix}play* https://youtu.be/...\n\n` +
                `_Estaré esperando su solicitud para comenzar la descarga._ ✍️✨`,
            contextInfo: ctx
        }, { quoted: m })
    }

    await m.react('🔍')

    try {
        // ── 1. Resolver búsqueda o link directo ──
        let song = null
        const isYtLink = query.includes('youtube.com/watch') || query.includes('youtu.be/')

        if (isYtLink) {
            const videoId = query.match(/(?:youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1]
            song = {
                title:    'YouTube Video',
                url:      query,
                author:   'N/A',
                duration: 'N/A',
                views:    'N/A',
                thumb:    videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
            }
        } else {
            song = await searchYoutube(query)
        }

        if (!song?.url) {
            await m.react('❌')
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `❌ ${global.botName}`, 'Búsqueda Fallida')
            return conn.sendMessage(m.chat, {
                text:
                    `👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬 ─── 👑\n\n` +
                    `🌷 *Mis disculpas.* No he logrado encontrar resultados en mis archivos para: *${query}*\n` +
                    `> ✨ Le sugiero intentar con un término más específico o proporcionar el enlace directo.\n\n` +
                    `_Ejemplo: https://youtu.be/..._ 🌟`,
                contextInfo: ctx
            }, { quoted: m })
        }

        // ── 2. Enviar info mientras descarga ──
        const caption =
            `👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖬𝖴𝖲𝖨𝖢 ─── 👑\n\n` +
            `🌟 *${song.title}*\n\n` +
            `🌺 *Canal* › ${song.author}\n` +
            `🌺 *Duración* › ${song.duration}\n` +
            `🌺 *Enlace* › ${song.url}\n\n` +
            `> ✨ _Por favor sea paciente. Estoy procesando y descargando su audio en este momento..._ 🌷`

        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, song.title.slice(0, 60), 'Descargando Audio... 🌺')
        ctx.externalAdReply.thumbnailUrl = song.thumb || global.banner
        ctx.externalAdReply.sourceUrl    = song.url

        if (song.thumb) {
            await conn.sendMessage(m.chat, { image: { url: song.thumb }, caption, contextInfo: ctx }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { text: caption, contextInfo: ctx }, { quoted: m })
        }

        await m.react('⬇️')

        // ── 3. Descargar audio desde NexEvo ──
        const audioUrl    = await getAudio(song.url)
        const audioRes    = await fetch(audioUrl)
        if (!audioRes.ok) throw new Error('Error al descargar audio: HTTP ' + audioRes.status)
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

        if (!audioBuffer || audioBuffer.length < 1000) {
            throw new Error('El audio descargado está vacío o corrupto')
        }

        // ── 4. Enviar audio ──
        const audioCtx = global.getNewsletterCtx(thumb, song.title.slice(0, 60), 'Audio entregado con éxito 🌟')
        audioCtx.externalAdReply.thumbnailUrl = song.thumb || global.banner
        audioCtx.externalAdReply.sourceUrl    = song.url

        await conn.sendMessage(m.chat, {
            audio:       audioBuffer,
            mimetype:    'audio/mpeg',
            ptt:         false, // true para nota de voz, false para documento de audio
            fileName:    song.title.slice(0, 60) + '.mp3',
            contextInfo: audioCtx
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[PLAY ERROR]', e.message)
        await m.react('❌')
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `❌ ${global.botName}`, 'Error Técnico')
        return conn.sendMessage(m.chat, {
            text:
                `👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬 ─── 👑\n\n` +
                `🌷 *Atención.* Se ha presentado una falla técnica durante el proceso:\n` +
                `> ✨ ${e.message}\n\n` +
                `_Le pido disculpas por el inconveniente. Por favor, intente nuevamente en unos minutos o reporte esto a Aarom._ 🌟`,
            contextInfo: ctx
        }, { quoted: m })
    }
}

handler.help    = ['play <canción o link>']
handler.tags    = ['descargas']
handler.command = ['play', 'mp3', 'ytmp3', 'musica', 'playaudio']
export default handler
