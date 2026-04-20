export default {
  command: ['cofre', 'suerte', 'regalo'],
  category: 'juegos',
  run: async (client, m, { usedPrefix, command, args }) => {
    // Configuración de la identidad Itsuki
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
        newsletterName: global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
        serverMessageId: -1
      }
    }

    // Si el usuario ya eligió un cofre (el botón envía el comando con el argumento)
    if (args[0]) {
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
                   `🌷 *Usted ha abierto el ${args[0].toUpperCase()} y esto es lo que contenía:*\n\n` +
                   `> ${randomSuerte}\n\n` +
                   `🌟 ━━━━━━━━━━━━━━━━━━ 🌟\n` +
                   `🌺 *Gracias por participar. Aarom & Félix esperan que haya sido de su agrado.* 🌷`
      
      return client.sendMessage(m.chat, { text: resTxt, contextInfo }, { quoted: m })
    }

    // Mensaje inicial con los botones
    let txt = `👑 ─── 𝖢𝖮𝖥𝖱𝖤 𝖬𝖨𝖲𝖳𝖤𝖱𝖨𝖮𝖲𝖮 ─── 👑\n\n` +
              `🌷 *Saludos. He preparado tres cofres especiales para usted. Elija con cuidado, pues cada uno guarda algo diferente.* ✨\n\n` +
              `> _¿Cuál desea abrir hoy?_`

    const buttons = [
      { buttonId: `${usedPrefix + command} cofre1`, buttonText: { displayText: '🎁 Cofre de Madera' }, type: 1 },
      { buttonId: `${usedPrefix + command} cofre2`, buttonText: { displayText: '🎁 Cofre de Plata' }, type: 1 },
      { buttonId: `${usedPrefix + command} cofre3`, buttonText: { displayText: '🎁 Cofre Dorado' }, type: 1 }
    ]

    const buttonMessage = {
      text: txt,
      footer: '✨ 𝖨𝗍𝗌𝗎𝗄𝗂 𝖭𝖺𝗄𝖺𝗇𝗈 𝖲𝗒𝗌𝗍𝖾𝗆',
      buttons: buttons,
      headerType: 1,
      contextInfo: contextInfo
    }

    await client.sendMessage(m.chat, buttonMessage, { quoted: m })
  }
}
