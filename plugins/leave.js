const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  command: ['leave', 'salir', 'abandonar', 'salte'],
  category: 'owner',
  run: async (m, { conn }) => {
    
    // Seguridad: Solo tú (Aarom) o tus sub-creadores pueden usarlo
    if (!m.isOwner) return

    // Comprobamos que el comando se esté usando en un grupo
    if (!m.isGroup) {
      return m.reply('🦋 *Este comando solo se puede usar dentro de un grupo, tonto.*')
    }

    // Configuración Nino Style 🦋
    const contextInfo = {
      isForwarded: true,
      forwardingScore: 99,
      externalAdReply: {
        title: '🦋 𝐍𝐈𝐍𝐎 𝐍𝐀𝐊𝐀𝐍𝐎 𝐒𝐘𝐒𝐓𝐄𝐌',
        body: 'Desconexión iniciada por Aarom ✨',
        mediaType: 1,
        thumbnailUrl: global.banner, // Asegúrate de tener tu banner de Nino aquí
        sourceUrl: global.rcanal
      },
      forwardedNewsletterMessageInfo: {
        newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
        newsletterName: global.newsletterName || '𓆩 ✧ 𝐍𝐢𝐧𝐨 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
        serverMessageId: -1
      }
    }

    // Mensaje de despedida con personalidad de Nino
    let txt = `🦋 ─── 𝐀𝐕𝐈𝐒𝐎 𝐃𝐄 𝐒𝐀𝐋𝐈𝐃𝐀 ─── 🦋\n\n` +
              `Mi creador me ha ordenado retirarme de este grupo. ¡No es como si quisiera quedarme aquí de todos modos, hmph! 🌸\n\n` +
              `> ✨ _Extracción solicitada con éxito._\n\n` +
              `¡Que les vaya bien! 🦋`

    // 1. Enviamos el mensaje de despedida
    await conn.sendMessage(m.chat, { text: txt, contextInfo }, { quoted: m })

    // 2. Esperamos 2.5 segundos para asegurar que WhatsApp entregue el mensaje a todos
    await delay(2500)

    // 3. El bot abandona el grupo automáticamente
    await conn.groupLeave(m.chat)
  }
}
