import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import { tmpdir } from 'os'
import { Readable } from 'stream'

// Configuración Itsuki Style 👑
const PACK_NAME = '𝖨𝖳𝖲𝖴𝖪𝖨 𝖭𝖠𝖪𝖠𝖭𝖮 🌟'
const PACK_AUTHOR = 'Aarom 👑'

const tempFolder = tmpdir()
const randomFileName = (ext) => `${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`

export default {
  command: ['sticker', 's', 'stk'],
  category: 'stickers',
  run: async (m, { conn, args, usedPrefix, command }) => {
    
    const contextInfo = {
      isForwarded: true,
      forwardingScore: 99,
      externalAdReply: {
        title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
        body: 'Creación de Stickers ✨',
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

    try {
      // Menú de ayuda Itsuki
      if (args[0] === '-list') {
        let helpTxt = `👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖳𝖨𝖢𝖪𝖤𝖱𝖲 ─── 👑\n\n` +
                      `🌷 *Instrucciones de uso:*\n` +
                      `Responda a una imagen, GIF o video corto (máx. 10s) con el comando:\n\n` +
                      `> 🌟 \`${usedPrefix + command}\`\n\n` +
                      `_Si desea personalizar el nombre, use:_\n` +
                      `> 🌟 \`${usedPrefix + command} Paquete | Autor\`\n\n` +
                      `🌺 *Estaré encantada de procesar su solicitud.* ✨`

        return conn.sendMessage(m.chat, { text: helpTxt, contextInfo }, { quoted: m })
      }

      if (!m.chat || typeof m.chat !== 'string') return

      const quoted = m.quoted || m
      const msg = quoted.msg || quoted

      const mime = msg.mimetype || ''
      const hasMedia = msg.url || msg.directPath

      if (!hasMedia) {
        let errTxt = `🌷 *Disculpe.* Para que pueda crear su sticker, necesito que responda a un mensaje que contenga una imagen o video. ✨`
        return conn.sendMessage(m.chat, { text: errTxt, contextInfo }, { quoted: m })
      }

      if (!/image|video|webp/.test(mime)) {
        let errTxt = `🌺 *Formato no compatible.* Por favor, asegúrese de responder a una imagen o archivo de video. 🌟`
        return conn.sendMessage(m.chat, { text: errTxt, contextInfo }, { quoted: m })
      }

      let buffer
      try {
        buffer = await quoted.download()
      } catch {
        return conn.sendMessage(m.chat, { text: '⚠️ *Lo lamento, no pude descargar el archivo multimedia. Por favor, intente de nuevo.*', contextInfo }, { quoted: m })
      }

      const isVideo = /video/.test(mime) || msg.gifPlayback

      if (isVideo && msg.seconds > 10) {
        let errTxt = `🌷 *Archivo muy extenso.* Para mantener el rendimiento del servidor, los videos no deben superar los 10 segundos. ✨`
        return conn.sendMessage(m.chat, { text: errTxt, contextInfo }, { quoted: m })
      }

      const marca = args.join(' ').split(/[•|]/).map(v => v.trim())
      const pack = marca[0] || PACK_NAME
      const author = marca[1] || PACK_AUTHOR

      const metadata = {
        packname: pack,
        author: author,
        categories: ['🌟']
      }

      let stickerPath = isVideo
        ? await writeExifVid(buffer, metadata)
        : await writeExifImg(buffer, metadata)

      const finalSticker = fs.readFileSync(stickerPath)

      // Enviamos el sticker finalizado
      await conn.sendMessage(m.chat, { sticker: finalSticker }, { quoted: m })

      if (fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error(e)
      const msgError = e?.stack?.slice(0, 300) || e.toString()
      await conn.sendMessage(m.chat, { text: `❌ *He detectado un error en mi sistema:*\n\n\`${msgError}\``, contextInfo }, { quoted: m })
    }
  }
}

// ==========================================
// FUNCIONES DE CONVERSIÓN (No modificar)
// ==========================================

function bufferToStream(buffer) {
  return new Readable({
    read() {
      this.push(buffer)
      this.push(null)
    }
  })
}

async function imageToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const chunks = []
    ffmpeg(bufferToStream(buffer))
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=15,format=rgba"
      ])
      .format('webp')
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on('data', c => chunks.push(c))
  })
}

async function videoToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const chunks = []
    ffmpeg(bufferToStream(buffer))
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=15,format=rgba",
        "-loop", "0",
        "-ss", "00:00:00",
        "-t", "00:00:05",
        "-preset", "default",
        "-an",
        "-vsync", "0"
      ])
      .format('webp')
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on('data', c => chunks.push(c))
  })
}

async function writeExifImg(media, metadata) {
  const wMedia = await imageToWebp(media)
  return await addExif(wMedia, metadata)
}

async function writeExifVid(media, metadata) {
  const wMedia = await videoToWebp(media)
  return await addExif(wMedia, metadata)
}

async function addExif(webpBuffer, metadata) {
  const tmpIn = path.join(tempFolder, randomFileName("webp"))
  const tmpOut = path.join(tempFolder, randomFileName("webp"))

  fs.writeFileSync(tmpIn, webpBuffer)

  const json = {
    "sticker-pack-id": "suki-3.0",
    "sticker-pack-name": metadata.packname,
    "sticker-pack-publisher": metadata.author,
    emojis: metadata.categories || [""]
  }

  const exifAttr = Buffer.from([
    0x49,0x49,0x2A,0x00,
    0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,
    0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,
    0x00,0x00
  ])

  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
  const exif = Buffer.concat([exifAttr, jsonBuff])
  exif.writeUIntLE(jsonBuff.length, 14, 4)

  const img = new webp.Image()
  await img.load(tmpIn)
  img.exif = exif
  await img.save(tmpOut)

  fs.unlinkSync(tmpIn)

  return tmpOut
}
