export default {
  command: ['hidetag', 'tag', 'todos'],
  category: 'grupo',
  isAdmin: true, // Asegúrate de que tu core use 'isAdmin' o cámbialo a 'admin: true'
  run: async (client, m, args, usedPrefix, command) => {
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => null) : null
    const groupParticipants = groupMetadata?.participants || []
    const mentions = groupParticipants.map(p => p.id)
    const userText = (args.join(' ') || '').trim()
    const src = m.quoted || m
    
    // Detección de tipos de media
    const hasImage = Boolean(src.message?.imageMessage || src.mtype === 'imageMessage')
    const hasVideo = Boolean(src.message?.videoMessage || src.mtype === 'videoMessage')
    const hasAudio = Boolean(src.message?.audioMessage || src.mtype === 'audioMessage')
    const hasSticker = Boolean(src.message?.stickerMessage || src.mtype === 'stickerMessage')
    const isQuoted = Boolean(m.quoted)
    const originalText = (src.caption || src.text || src.body || '').trim()

    // Configuración del Newsletter y AdReply (Estilo Itsuki)
    const contextInfo = {
      isForwarded: true,
      forwardingScore: 99,
      externalAdReply: {
        title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
        body: 'Comunicado de Aarom ✨',
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
      const options = { mentions, contextInfo, quoted: null }

      // Tag con Imagen o Video
      if (hasImage || hasVideo) {
        const media = await src.download()
        const caption = isQuoted ? originalText : userText
        if (hasImage) {
          return client.sendMessage(m.chat, { image: media, caption, ...options })
        } else {
          return client.sendMessage(m.chat, { video: media, mimetype: 'video/mp4', caption, ...options })
        }
      }

      // Tag con Audio
      if (hasAudio) {
        const media = await src.download()
        return client.sendMessage(m.chat, { audio: media, mimetype: 'audio/mp4', fileName: 'hidetag.mp3', ...options })
      }

      // Tag con Sticker
      if (hasSticker) {
        const media = await src.download()
        return client.sendMessage(m.chat, { sticker: media, ...options })
      }

      // Tag con Texto (Quoted o Nuevo)
      const finalChat = (isQuoted && originalText) ? originalText : userText
      if (finalChat) {
        let txt = `👑 ─── 𝖠𝖵𝖨𝖲𝖮 𝖦𝖤𝖭𝖤𝖱𝖠𝖫 ─── 👑\n\n${finalChat}\n\n🌟 ━━━━━━━━━━━━━━━━━━ 🌟`
        return client.sendMessage(m.chat, { text: txt, ...options })
      }

      return m.reply(`🌷 *Protocolo incompleto.* Ingrese un texto o responda a un mensaje para realizar el tag general. ✨`)

    } catch (e) {
      return m.reply(`> ❌ Error en el sistema: *${e.message}*`)
    }
  }
}
