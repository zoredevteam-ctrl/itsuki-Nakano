export default {
  command: ['ppt', 'jugar', 'desafio'],
  category: 'juegos',
  run: async (m, { conn, args, usedPrefix, command }) => {
    const opciones = ['piedra', 'papel', 'tijera']
    const userChoice = args[0]?.toLowerCase()

    // Configuración Itsuki Style 👑
    const contextInfo = {
      isForwarded: true,
      forwardingScore: 99,
      externalAdReply: {
        title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
        body: 'Desafío de Itsuki ✨',
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

    // Si el usuario no elige una opción válida, Itsuki da las instrucciones
    if (!opciones.includes(userChoice)) {
      let txt = `👑 ─── 𝖣𝖤𝖲𝖠𝖥𝖨𝖮 𝖣𝖤 𝖨𝖳𝖲𝖴𝖪𝖨 ─── 👑\n\n` +
                `🌷 *Saludos.* Si desea despejar la mente un momento, le propongo una partida rápida de Piedra, Papel o Tijera.\n\n` +
                `🌟 *¿Cómo jugar?*\n` +
                `› Escriba: \`${usedPrefix + command} piedra\`\n` +
                `› Escriba: \`${usedPrefix + command} papel\`\n` +
                `› Escriba: \`${usedPrefix + command} tijera\`\n\n` +
                `_Estaré esperando su elección para comenzar el desafío._ ✨`
      return conn.sendMessage(m.chat, { text: txt, contextInfo }, { quoted: m })
    }

    // Lógica del juego
    const botChoice = opciones[Math.floor(Math.random() * opciones.length)]
    let resultado = ''
    let extraMsg = ''

    if (userChoice === botChoice) {
      resultado = '𝖤𝖬𝖯𝖠𝖳𝖤'
      extraMsg = 'Vaya, parece que hemos pensado exactamente lo mismo. Un buen empate. 🌺'
    } else if (
      (userChoice === 'piedra' && botChoice === 'tijera') ||
      (userChoice === 'papel' && botChoice === 'piedra') ||
      (userChoice === 'tijera' && botChoice === 'papel')
    ) {
      resultado = '𝖵𝖨𝖢𝖳𝖮𝖱𝖨𝖠'
      extraMsg = '¡Felicidades! Ha demostrado ser muy hábil. Usted gana esta vez. 🌟'
    } else {
      resultado = '𝖣𝖤𝖱𝖱𝖮𝖳𝖠'
      extraMsg = 'Lo lamento, pero la victoria es mía en esta ocasión. Puede intentarlo de nuevo si lo desea. 👑'
    }

    // Mensaje final con los resultados
    let txt = `👑 ─── 𝖱𝖤𝖲𝖴𝖫𝖳𝖠𝖣𝖮 ─── 👑\n\n` +
              `👤 *Usted eligió:* ${userChoice}\n` +
              `🌷 *Yo elegí:* ${botChoice}\n\n` +
              `✨ *Resultado final:* **${resultado}**\n` +
              `> _${extraMsg}_`

    await conn.sendMessage(m.chat, { text: txt, contextInfo }, { quoted: m })
  }
}
