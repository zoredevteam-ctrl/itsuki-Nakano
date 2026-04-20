/**
 * STICKERS - ITSUKI NAKANO
 * #s, #sticker, #toimg
 * Z0RT SYSTEMS 🌸
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys'
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
        const json = JSON.stringify({
            'sticker-pack-id':        'itsuki_' + Date.now(),
            'sticker-pack-name':      pack,
            'sticker-pack-publisher': author,
            'emojis': ['🌸']
        })
        const jsonBuf    = Buffer.from(json, 'utf8')
        const exifHeader = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00])
        const countBuf   = Buffer.alloc(4); countBuf.writeUInt32LE(jsonBuf.length, 0)
        const offsetBuf  = Buffer.alloc(4); offsetBuf.writeUInt32LE(0x16, 0)
        let exifData     = Buffer.concat([exifHeader, countBuf, offsetBuf, jsonBuf])
        const origLen    = exifData.length
        let chunkData    = exifData
        if (origLen % 2 === 1) chunkData = Buffer.concat([chunkData, Buffer.from([0x00])])
        const chunkName  = Buffer.from('EXIF')
        const chunkSize  = Buffer.alloc(4); chunkSize.writeUInt32LE(origLen, 0)
        const added      = Buffer.concat([chunkName, chunkSize, chunkData])
        let result       = Buffer.concat([buffer, added])
        result.writeUInt32LE(result.length - 8, 4)
        return result
    } catch { return buffer }
}

const imageToWebp = async (buffer) => {
    const input = tmp('img'); const output = tmp('webp')
    try {
        await writeFile(input, buffer)
        await execAsync(`ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0" -quality 80 "${output}"`)
        return await readFile(output)
    } finally { await unlink(input).catch(()=>{}); await unlink(output).catch(()=>{}) }
}

const videoToWebp = async (buffer) => {
    const input = tmp('mp4'); const output = tmp('webp')
    try {
        await writeFile(input, buffer)
        await execAsync(`ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0,fps=15" -vcodec libwebp -lossless 0 -compression_level 6 -quality 50 -loop 0 -preset picture -an -vsync 0 -t 8 "${output}"`)
        return await readFile(output)
    } finally { await unlink(input).catch(()=>{}); await unlink(output).catch(()=>{}) }
}

let handler = async (m, { conn, command, text }) => {
    const cmd    = command.toLowerCase()
    const quoted = m.quoted || m
    const msg    = quoted?.message || m.message

    // ── TOIMG ─────────────────────────────────────────────────────────────────
    if (cmd === 'toimg') {
        const q    = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''
        if (!mime || !/webp/.test(mime)) return sendStk(conn, m,
            `🌸 *TOIMG*\n\nResponde a un *sticker* para convertirlo a imagen~\n_Ejemplo: responde al sticker con *${global.prefix||'#'}toimg*_`
        )
        await m.react('⏳')
        try {
            // CORRECCIÓN: Se usa la función importada directamente
            const media = await downloadMediaMessage(q, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🖼️ ${global.botName||'Itsuki Nakano'}`, 'Sticker → Imagen 🌸')
            await conn.sendMessage(m.chat, { image: media, caption: `🖼️ *¡Aquí está tu imagen!*\n\n_Con cariño~ 🌸_`, contextInfo: ctx }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            await sendStk(conn, m, `❌ Error: ${e.message}`, true)
        }
        return
    }

    // ── STICKER ───────────────────────────────────────────────────────────────
    if (!msg) return sendStk(conn, m,
        `🌸 *STICKER MAKER*\n\nResponde a una *imagen*, *video* o *GIF* con *${global.prefix||'#'}s*~\n\n_Ejemplo: #s NombrePack | Autor_`
    )

    const imageMsg   = msg.imageMessage
    const videoMsg   = msg.videoMessage
    const stickerMsg = msg.stickerMessage
    const gifMsg     = videoMsg?.gifPlayback ? videoMsg : null

    if (!imageMsg && !videoMsg && !stickerMsg) return sendStk(conn, m,
        `🌸 Responde a una *imagen*, *video* o *GIF*~`
    )

    const parts  = (text || '').split('|').map(s => s.trim())
    const pack   = parts[0] || PACK_NAME
    const author = parts[1] || PACK_AUTHOR

    await m.react('⏳')
    try {
        let webpBuffer
        // CORRECCIÓN GLOBAL: Se reemplaza conn.downloadMediaMessage por la función importada
        const mediaBuffer = await downloadMediaMessage(quoted, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })

        if (stickerMsg) {
            webpBuffer = mediaBuffer
        } else if (gifMsg || videoMsg) {
            webpBuffer = await videoToWebp(mediaBuffer)
        } else {
            webpBuffer = await imageToWebp(mediaBuffer)
        }

        if (!webpBuffer || webpBuffer.length < 100) throw new Error('WebP vacío o corrupto')

        const final = await addExif(webpBuffer, pack, author)
        await conn.sendMessage(m.chat, { sticker: final }, { quoted: m })
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        let errMsg = `❌ *Error al crear sticker*\n\n⚠️ ${e.message}`
        if (e.message.includes('ffmpeg')) errMsg += '\n_Instala ffmpeg: `apt install ffmpeg`_';
        console.error(e)
        await sendStk(conn, m, errMsg, true)
    }
}

handler.command = ['s', 'sticker', 'stk', 'toimg', 'toimage']
export default handler
