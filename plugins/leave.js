const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  command: ['leave', 'salir', 'abandonar', 'salte'],
  category: 'owner',
  run: async (m, { conn }) => {
    try {
      // Seguridad: Solo tú (Aarom) o tus sub-creadores pueden usarlo
      if (!m.isOwner) return

      // Comprobamos que el comando se esté usando en un grupo
      if (!m.isGroup) {
        return m.reply('🌷 *Disculpe, Aarom. Este comando solo puede ser ejecutado dentro de las instalaciones de un grupo. ✨*')
      }

      // Configuración Itsuki Nakano (Elegante y Formal) 👑
      const contextInfo = {
        isForwarded: true,
        forwardingScore: 99,
        externalAdReply: {
          title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
          body: 'Desconexión iniciada por Aarom ✨',
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

      // Mensaje de despedida con el tono educado de Itsuki
      let txt = `👑 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 👑\n\n` +
                `Mi creador ha solicitado mi retiro de este grupo. Agradezco sinceramente el tiempo compartido con todos ustedes. 🌺\n\n` +
                `> ✨ _Procediendo con la extracción del sistema._\n\n` +
                `¡Les deseo un día espléndido! 🌷`

      // 1. Enviamos el mensaje de despedida
      await conn.sendMessage(m.chat, { text: txt, contextInfo }, { quoted: m })

      // 2. Esperamos 2.5 segundos para que todos alcancen a leerlo
      await delay(2500)

      // 3. El bot abandona el grupo automáticamente
      await conn.groupLeave(m.chat)

    } catch (e) {
      console.error(e)
      await m.reply('❌ *Discúlpeme, Aarom. Ha ocurrido un error al intentar abandonar el grupo. Por favor, revise la consola.*')
    }
  }
}
