let handler = async (m, { conn, text }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid[0] || (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    if (!who) return m.reply('🌷 *Mencione al usuario.*')

    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    let txt = `🌟 @${who.split('@')[0]} ha sido promovido a **Ayudante del Rey**.\n✨ *Por:* @${m.sender.split('@')[0]}`

    await conn.sendMessage(m.chat, { 
        text: txt, 
        mentions: [who, m.sender],
        contextInfo: {
            externalAdReply: {
                title: '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
                body: 'By: Aarom ✨',
                mediaType: 1,
                thumbnailUrl: global.banner,
                sourceUrl: global.rcanal
            }
        }
    }, { quoted: m })
}
handler.command = ['promote', 'promover']
handler.admin = handler.botAdmin = handler.group = true
export default handler
