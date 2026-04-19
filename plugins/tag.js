export default {
  command: ['hidetag', 'tag', 'todos'],
  category: 'grupo',
  isAdmin: true, 
  run: async (client, m, { args, participants }) => {
    // Usamos directamente 'participants' que ya viene en los argumentos del comando
    const groupParticipants = participants || []
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

    // Configuración Itsuki Style 👑
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

      if (hasImage || hasVideo) {
        const media = await src.download()
        const caption = isQuoted ? originalText : userText
        if (hasImage) {
          return client.sendMessage(m.chat, { image: media, caption, ...options })
        } else {
          return client.sendMessage(m.chat, { video: media, mimetype: 'video/mp4', caption, ...options })
        }
      }

      if (hasAudio) {
        const media = await src.download()
        return client.sendMessage(m.chat, { audio: media, mimetype: 'audio/mp4', fileName: 'hidetag.mp3', ...options })
      }

      if (hasSticker) {
        const media = await src.download()
        return client.sendMessage(m.chat, { sticker: media, ...options })
      }

      const finalChat = (isQuoted && originalText) ? originalText : userText
      if (finalChat) {
        let txt = `👑 ─── 𝖠𝖵𝖨𝖲𝖮 𝖦𝖤𝖭𝖤𝖱𝖠𝖫 ─── 👑\n\n${finalChat}\n\n🌟 ━━━━━━━━━━━━━━━━━━ 🌟`
        return client.sendMessage(m.chat, { text: txt, ...options })
      }

      return m.reply(`🌷 *Protocolo incompleto.* Ingrese un texto o responda a un mensaje. ✨`)

    } catch (e) {
      console.error(e)
      return m.reply(`> ❌ Error técnico: *${e.message}*`)
    }
  }
}
