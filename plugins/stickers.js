/**
 * STICKERS - ITSUKI NAKANO
 * #s, #sticker, #toimg
 * Z0RT SYSTEMS 🌸
 */

import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

const execAsync = promisify(exec)
const tmp = (ext) => join(tmpdir(), `itsuki_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)

const PACK_NAME   = global.botName   || 'Itsuki Nakano'
const PACK_AUTHOR = global.ownerName || '𝓐𝓪𝓻𝓸𝓶'

const sendStk = async (conn, m, text, isError = false) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        (isError ? '❌ ' : '🌸 ') + (global.botName || 'Itsuki Nakano'),
        isError ? 'Error al crear sticker' : 'Sticker Maker'
    )
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

const addExif = async (buffer, pack, author) => {
    try {
        const json = {
            'sticker-pack-id': `itsuki-${Date.now()}`,
            'sticker-pack-name': pack,
            'sticker-pack-publisher': author,
            'emojis': ['🌸']
        }
        const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
        const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8')
        const lenBuf = Buffer.allocUnsafe(4)
        lenBuf.writeUInt32LE(jsonBuf.length, 0)
        const exif = Buffer.concat([exifHeader, lenBuf, jsonBuf])
        let len = buffer.length
        if (buffer[len - 2] === 0x00) len--
        return Buffer.concat([buffer.slice(0, len), Buffer.from('EXIF'), lenBuf, exif])
    } catch { return buffer }
}

const imageToWebp = async (buffer) => {
    const input = tmp('img'); const output = tmp('webp')
    try {
        await writeFile(input, buffer)
        await execAsync(`ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -pix_fmt yuva420p -q:v 75 "${output}"`)
        return await readFile(output)
    } finally { 
        await Promise.all([unlink(input).catch(()=>{}), unlink(output).catch(()=>{} )])
    }
}

const videoToWebp = async (buffer) => {
    const input = tmp('mp4'); const output = tmp('webp')
    try {
        await writeFile(input, buffer)
        await execAsync(`ffmpeg -i "${input}" -vcodec libwebp -filter:v "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -lossless 0 -compression_level 4 -q:v 50 -loop 0 -preset picture -an -vsync 0 -t 10 "${output}"`)
        return await readFile(output)
    } finally { 
        await Promise.all([unlink(input).catch(()=>{}), unlink(output).catch(()=>{} )])
    }
}

let handler = async (m, { conn, command, text }) => {
    const cmd = command.toLowerCase()
    
    // 1. Detectar el mensaje real (si es respuesta o mensaje directo)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    // ── TOIMG ─────────────────────────────────────────────────────────────────
    if (cmd === 'toimg') {
        if (!/webp/.test(mime)) return sendStk(conn, m, `🌸 Responde a un sticker para convertirlo.`)
        await m.react('⏳')
        try {
            const media = await downloadMediaMessage(q, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
            await conn.sendMessage(m.chat, { image: media, caption: `🌸 *¡Aquí tienes!*` }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            await sendStk(conn, m, `❌ Error: ${e.message}`, true)
        }
        return
    }

    // ── STICKER ───────────────────────────────────────────────────────────────
    // Validar si el mensaje contiene multimedia
    if (!/image|video|sticker/.test(mime)) {
        return sendStk(conn, m, `🌸 Responde a una *imagen*, *video* o *GIF* para crear un sticker.`)
    }

    const parts  = (text || '').split('|').map(s => s.trim())
    const pack   = parts[0] || PACK_NAME
    const author = parts[1] || PACK_AUTHOR

    await m.react('⏳')
    try {
        // Descargar usando el objeto 'q' que ya extrajimos correctamente
        const mediaBuffer = await downloadMediaMessage(q, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
        if (!mediaBuffer) throw new Error("No se pudo descargar el archivo.")

        let webpBuffer
        if (/sticker/.test(mime)) {
            webpBuffer = mediaBuffer
        } else if (/video/.test(mime)) {
            webpBuffer = await videoToWebp(mediaBuffer)
        } else {
            webpBuffer = await imageToWebp(mediaBuffer)
        }

        const final = await addExif(webpBuffer, pack, author)
        await conn.sendMessage(m.chat, { sticker: final }, { quoted: m })
        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        await sendStk(conn, m, `❌ *Error*\n${e.message}`, true)
    }
}

handler.command = ['s', 'sticker', 'stk', 'toimg', 'toimage']
export default handler
