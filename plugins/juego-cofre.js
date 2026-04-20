export default {
  command: ['cofre', 'suerte', 'regalo'],
  category: 'juegos',
  run: async (m, { conn, args, usedPrefix, command }) => {
    // Definimos los argumentos de forma segura
    const textArgs = args || []
    const cofreElegido = textArgs[0]

    // Configuración Itsuki Style 👑
    const contextInfo = {
      isForwarded: true,
      forwardingScore: 99,
      externalAdReply: {
        title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
        body: 'Pruebe su fortuna con Aarom ✨',
        mediaType: 1,
        thumbnailUrl: global.banner,
        sourceUrl: global.rcanal
      },
      forwardedNewsletterMessageInfo: {
        newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
        newsletterName: global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝐞𝐬 ✧ 𓆪',
        serverMessageId: -1
      }
    }

    // Lógica si el usuario ya tocó un botón
    if (cofreElegido) {
      const suertes = [
        "🌟 ¡Excelente elección! Su fortuna hoy es de 100%. Un gran éxito le espera.",
        "🌷 Ha encontrado una nota de estudio: 'El esfuerzo de hoy es el triunfo de mañana'.",
        "💎 ¡Brillante! Ha obtenido un diamante virtual de cortesía.",
        "🌺 Un cofre vacío... pero con un aroma a flores muy agradable. Inténtelo luego.",
        "👑 Itsuki le sonríe. Su suerte ha mejorado notablemente.",
        "✨ Ha encontrado un cupón para una cena imaginaria. ¡Qué delicia!"
      ]
      const randomSuerte = suertes[Math.floor(Math.random() * suertes.length)]
      
      let resTxt = `👑 ─── 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮 ─── 👑\n\n` +
                   `🌷 *Usted ha abierto el ${cofreElegido.toUpperCase()} y esto es lo que contenía:*\n\n` +
                   `> ${randomSuerte}\n\n` +
                   `🌟 ━━━━━━━━━━━━━━━━━━ 🌟\n` +
                   `🌺 *Gracias por participar. Aarom & Félix esperan que haya sido de su agrado.* 🌷`
      
      return conn.sendMessage(m.chat, { text: resTxt, contextInfo }, { quoted: m })
    }

    // Mensaje inicial con los botones
    let txt = `👑 ─── 𝖢𝖮𝖥𝖱𝖤 𝖬𝖨𝖲𝖳𝖤𝖱𝖨𝖮𝖲𝖮 ─── 👑\n\n` +
              `🌷 *Saludos. He preparado tres cofres especiales para usted. Elija con cuidado, pues cada uno guarda algo diferente.* ✨\n\n` +
              `> _¿Cuál desea abrir hoy?_`

    const buttons = [
      { buttonId: `${usedPrefix + command} madera`, buttonText: { displayText: '🎁 Madera' }, type: 1 },
      { buttonId: `${usedPrefix + command} plata`, buttonText: { displayText: '🎁 Plata' }, type: 1 },
      { buttonId: `${usedPrefix + command} oro`, buttonText: { displayText: '🎁 Dorado' }, type: 1 }
    ]

    const buttonMessage = {
      text: txt,
      footer: '✨ 𝖨𝗍𝗌𝗎𝗄𝗂 𝖭𝖺𝗄𝖺𝗇𝗈 𝖲𝗒𝗌𝗍𝖾𝗆',
      buttons: buttons,
      headerType: 1,
      contextInfo: contextInfo
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }
}
