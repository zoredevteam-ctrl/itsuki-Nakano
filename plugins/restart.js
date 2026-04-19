let handler = async (m, { conn }) => {
    let txt = `👑 ─── 𝖱𝖤𝖨𝖭𝖨𝖢𝖨𝖮 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ─── 👑\n\n🌷 *Entendido.* Procediendo a reiniciar mis protocolos internos.\n> ✨ _Estaré de regreso en unos instantes._ 🌟`

    // Enviamos el mensaje de aviso primero
    await conn.sendMessage(m.chat, { 
        text: txt, 
        contextInfo: {
            isForwarded: true,
            forwardingScore: 99,
            externalAdReply: {
                title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
                body: 'By: Aarom ✨',
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
    }, { quoted: m })

    // Un pequeño retraso para asegurar que el mensaje llegue antes de apagar
    setTimeout(() => {
        process.exit() // Esto apaga el bot, y tu consola (o PM2) lo volverá a iniciar automáticamente.
    }, 2000)
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar']
handler.rowner = true // Solo los dueños del bot (tú) pueden usarlo

export default handler
