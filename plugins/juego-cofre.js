export default {
  command: ['cofre', 'suerte', 'regalo'],
  category: 'juegos',
  run: async (m, { conn, args, usedPrefix, command }) => {
    // Definimos la opción elegida
    const cofreElegido = args[0]?.toLowerCase()

    // Configuración Itsuki Style 👑
    const contextInfo = {
      isForwarded: true,
      forwardingScore: 99,
      externalAdReply: {
        title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
        body: 'Fortuna para Aarom ✨',
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

    // 1. Si el usuario ya eligió un cofre (ejemplo: #suerte 1)
    const suertes = {
      '1': "🌟 ¡Excelente elección! Su fortuna hoy es de 100%. Un gran éxito le espera.",
      '2': "🌷 Ha encontrado una nota de estudio: 'El esfuerzo de hoy es el triunfo de mañana'.",
      '3': "💎 ¡Brillante! Ha obtenido un diamante virtual de cortesía.",
      'madera': "🌟 Fortuna del 100%. Un gran éxito le espera.",
      'plata': "💎 ¡Brillante! Ha obtenido un diamante virtual.",
      'oro': "👑 Itsuki le sonríe. Su suerte ha mejorado notablemente."
    }

    if (cofreElegido && suertes[cofreElegido]) {
      let resTxt = `👑 ─── 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮 ─── 👑\n\n` +
                   `🌷 *Usted ha abierto el cofre y esto es lo que contenía:*\n\n` +
                   `> ${suertes[cofreElegido]}\n\n` +
                   `🌟 ━━━━━━━━━━━━━━━━━━ 🌟\n` +
                   `🌺 *Atentamente: Itsuki Nakano System* 🌷`
      
      return conn.sendMessage(m.chat, { text: resTxt, contextInfo }, { quoted: m })
    }

    // 2. Mensaje inicial si no ha elegido nada (Menú visual)
    let txt = `👑 ─── 𝖢𝖮𝖥𝖱𝖤 𝖬𝖨𝖲𝖳𝖤𝖱𝖨𝖮𝖲𝖮 ─── 👑\n\n` +
              `🌷 *Saludos. He preparado tres cofres especiales. Por favor, responda con el número del cofre que desea abrir.* ✨\n\n` +
              `🎁 *1* ‹ Madera\n` +
              `🎁 *2* ‹ Plata\n` +
              `🎁 *3* ‹ Dorado\n\n` +
              `> _Ejemplo: ${usedPrefix + command} 1_\n\n` +
              `🌟 ━━━━━━━━━━━━━━━━━━ 🌟`

    await conn.sendMessage(m.chat, { 
      text: txt, 
      contextInfo 
    }, { quoted: m })
  }
}
