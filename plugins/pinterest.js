/**
 * PINTEREST - ITSUKI NAKANO
 * Comandos: #pinterest, #pin
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── DESCARGA DESDE URL ───────────────────────────────────────────────────────

const dlPin = async (url) => {
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const $ = cheerio.load(res.data)

    const videoTag = $('script[data-test-id="video-snippet"]')
    if (videoTag.length) {
      const result = JSON.parse(videoTag.text())
      return {
        title: result.name || 'Pinterest',
        download: result.contentUrl,
        isVideo: true
      }
    }

    const json = JSON.parse($("script[data-relay-response='true']").eq(0).text())
    const result = json.response.data['v3GetPinQuery'].data

    return {
      title: result.title || 'Pinterest',
      download: result.imageLargeUrl,
      isVideo: false
    }
  } catch {
    return null
  }
}

// ─── BÚSQUEDA ────────────────────────────────────────────────────────────────

const searchPins = async (query) => {
  try {
    const res = await axios.get(`https://pinterest.com/search/pins/?q=${encodeURIComponent(query)}`)
    const matches = [...res.data.matchAll(/"url":"(https:\/\/i\.pinimg\.com[^"]+)"/g)]

    return matches.map(v => v[1].replace(/\\u002F/g, '/')).slice(0, 20)
  } catch {
    return []
  }
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, args }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text:
        `🍽️ *PINTEREST — ITSUKI* 📌\n\n` +
        `Dime qué quieres buscar.\n\n` +
        `▸ *#pin <búsqueda>*\n` +
        `▸ *#pin <url>*`,
      contextInfo: {
        externalAdReply: {
          title: `📌 ${global.botName || 'Itsuki Nakano'}`,
          body: 'Pinterest Search',
          thumbnailUrl: global.banner || '',
          sourceUrl: global.rcanal || '',
          mediaType: 1
        }
      }
    }, { quoted: m })
  }

  await m.react('🔍')

  try {
    // ── DESCARGA ─────────────────────────────────────
    if (text.includes('https://')) {
      const data = await dlPin(args[0])

      if (!data?.download) {
        await m.react('❌')
        return m.reply('❌ No pude descargar ese pin.')
      }

      await conn.sendMessage(m.chat, {
        [data.isVideo ? 'video' : 'image']: { url: data.download },
        caption: `📌 *${data.title}*\n> ${global.botName || 'Itsuki Nakano'}`
      }, { quoted: m })

      await m.react('✅')
      return
    }

    // ── BÚSQUEDA (ÁLBUM) ─────────────────────────────
    const urls = await searchPins(text)

    if (!urls.length) {
      await m.react('❌')
      return m.reply(`❌ No encontré resultados para "${text}"`)
    }

    const top = urls.slice(0, 10)

    // 🔥 AQUÍ ESTÁ EL CAMBIO: ENVÍO EN ÁLBUM
    const media = top.map((url, i) => ({
      image: { url },
      ...(i === 0 && {
        caption: `📌 *${text}*\n> ${global.botName || 'Itsuki Nakano'}`
      })
    }))

    await conn.sendMessage(m.chat, {
      image: media.map(v => v.image),
      caption: media[0].caption
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['pinterest', 'pin']
export default handler