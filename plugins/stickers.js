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

// --- FUNCIONES DE CONVERSIÓN ---
const addExif = async (buffer, pack, author) => {
    try {
        const json = { 'sticker-pack-id': `itsuki-${Date.now()}`, 'sticker-pack-name': pack, 'sticker-pack-publisher': author, 'emojis': ['🌸'] }
        const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
        const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8')
        const lenBuf = Buffer.allocUnsafe(4); lenBuf.writeUInt32LE(jsonBuf.length, 0)
        const exif = Buffer.concat([exifHeader, lenBuf, jsonBuf])
        let len = buffer.length; if (buffer[len - 2] === 0x00) len--
        return Buffer.concat([buffer.slice(0, len), Buffer.from('EXIF'), lenBuf, exif])
    } catch { return buffer }
}

const imageToWebp = async (buffer) => {
    const input = tmp('img'); const output = tmp('webp')
    try {
        await writeFile(input, buffer)
        await execAsync(`ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -pix_fmt yuva420p -q:v 75 "${output}"`)
        return await readFile(output)
    } finally { await Promise.all([unlink(input).catch(()=>{}), unlink(output).catch(()=>{} )]) }
}

const videoToWebp = async (buffer) => {
    const input = tmp('mp4'); const output = tmp('webp')
    try {
        await writeFile(input, buffer)
        await execAsync(`ffmpeg -i "${input}" -vcodec libwebp -filter:v "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -lossless 0 -compression_level 4 -q:v 50 -loop 0 -preset picture -an -vsync 0 -t 10 "${output}"`)
        return await readFile(output)
    } finally { await Promise.all([unlink(input).catch(()=>{}), unlink(output).catch(()=>{} )]) }
}

let handler = async (m, { conn, command, text }) => {
    const cmd = command.toLowerCase()
    
    // 🛠️ DETECCIÓN MEJORADA DE MENSAJE
    // Buscamos el mensaje donde está el contenido multimedia
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    // Si es un mensaje de "Ver una sola vez", el contenido está más profundo
    if (q.viewOnceMessageV2) {
        q = q.viewOnceMessageV2.message
        mime = q[Object.keys(q)[0]].mimetype || ''
    }

    // ── TOIMG ──────────────────────────────────────────────────
    if (cmd === 'toimg') {
        if (!/webp/.test(mime)) return sendStk(conn, m, `🌸 Responde a un sticker.`)
        await m.react('⏳')
        try {
            const media = await downloadMediaMessage(q, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
            await conn.sendMessage(m.chat, { image: media, caption: `🌸 ¡Listo!` }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌'); await sendStk(conn, m, `❌ Error: ${e.message}`, true)
        }
        return
    }

    // ── STICKER ────────────────────────────────────────────────
    // Si no hay media, enviamos ayuda
    if (!/image|video|sticker/.test(mime)) {
        return sendStk(conn, m, `🌸 Responde a una imagen, video o GIF con *${global.prefix||'#'}s*`)
    }

    const parts  = (text || '').split('|').map(s => s.trim())
    const pack   = parts[0] || PACK_NAME
    const author = parts[1] || PACK_AUTHOR

    await m.react('⏳')
    try {
        // 🚨 AQUÍ ESTÁ EL FIX CRÍTICO:
        // Si 'q' no tiene la propiedad 'message', lo envolvemos para que downloadMediaMessage no explote
        let downloadObj = q.message ? q : { message: q }
        if (q.quoted) downloadObj = q // Si ya tiene estructura completa

        const mediaBuffer = await downloadMediaMessage(downloadObj, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
        
        if (!mediaBuffer) throw new Error("No se pudo obtener el contenido multimedia.")

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
        console.error("ERROR COMPLETO:", e)
        await m.react('❌')
        await sendStk(conn, m, `❌ *Error*\n${e.message}`, true)
    }
}

handler.command = ['s', 'sticker', 'stk', 'toimg', 'toimage']
export default handler
