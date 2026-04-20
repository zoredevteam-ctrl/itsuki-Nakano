import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

export default {
  command: ['cofre', 'suerte', 'regalo'],
  category: 'juegos',
  run: async (m, { conn, args, usedPrefix, command }) => {
    const cofreElegido = args[0]

    // 1. Lógica si el usuario ya tocó un botón
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
                   `🌺 *Atentamente: Itsuki Nakano System* 🌷`
      
      return conn.sendMessage(m.chat, { text: resTxt }, { quoted: m })
    }

    // 2. Construcción del mensaje interactivo (Botones Nuevos)
    const interactiveMessage = {
      body: { text: `👑 ─── 𝖢𝖮𝖥𝖱𝖤 𝖬𝖨𝖲𝖳𝖤𝖱𝖨𝖮𝖲𝖮 ─── 👑\n\n🌷 *Saludos. He preparado tres cofres especiales para usted. Elija con cuidado.*\n\n> _¿Cuál desea abrir hoy?_` },
      footer: { text: '✨ 𝖨𝗍𝗌𝗎𝗄𝗂 𝖭𝖺𝗄𝖺𝗇𝗈 𝖲𝗒𝗌𝗍𝖾𝗆' },
      header: {
        title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
        hasSubtitle: true,
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🎁 Madera",
              id: `${usedPrefix + command} madera`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🎁 Plata",
              id: `${usedPrefix + command} plata`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🎁 Dorado",
              id: `${usedPrefix + command} oro`
            })
          }
        ]
      },
      contextInfo: {
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
    }

    const message = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: interactiveMessage
        }
      }
    }, { userJid: conn.user.id, quoted: m })

    await conn.relayMessage(m.chat, message.message, { messageId: message.key.id })
  }
}
