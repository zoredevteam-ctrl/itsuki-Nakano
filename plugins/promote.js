let handler = async (m, { conn, text }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid[0] || (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    
    if (!who) return m.reply('🌷 *Mencione al usuario.*')
    
    // Verificar si el usuario ya es admin para evitar el error falso
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    const target = participants.find(u => u.id === who)
    
    if (target && (target.admin === 'admin' || target.admin === 'superadmin')) {
        return m.reply('✨ *Ese usuario ya es un Ayudante del Rey.*')
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    let txt = `🌟 @${who.split('@')[0]} ha sido promovido a **Ayudante del Rey**.\n✨ *Por:* @${m.sender.split('@')[0]}`

    await conn.sendMessage(m.chat, { 
        text: txt, 
        mentions: [who, m.sender],
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
}

handler.help = ['promote']
handler.tags = ['group']
handler.command = ['promote', 'promover']
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler
