import { database } from '../lib/database.js'

const getBannerBuffer = async (bannerSrc) => {
    if (!bannerSrc) return null
    try {
        if (bannerSrc.startsWith('data:image')) return Buffer.from(bannerSrc.split(',')[1], 'base64')
        const res = await fetch(bannerSrc)
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn, usedPrefix }) => {
    const nombreBot = global.botName || 'Itsuki Nakano'
    const bannerSrc = global.banner
    const canalLink = global.rcanal || ''
    
    const sender = (m.sender || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '')
                                   .split('@')[0].split(':')[0] + '@s.whatsapp.net'
    const username = m.pushName || 'Usuario'

    // Fecha configurada para tu zona horaria
    const date = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date())

    // Texto con la personalidad de Itsuki
    const txt = `
╔══❖═══✧═══❖════❖══╗
║ 𝖨𝖳𝖲𝖴𝖪𝖨 𝖭𝖠𝖪𝖠𝖭𝖮 𝖲𝖸𝖲𝖳𝖤𝖬║✨
╚══❖═══✧═══❖════❖══╝ 

 *Sea usted bienvenido, ${username}. He organizado cuidadosamente cada sección para que su experiencia sea eficiente y ordenada.*

╔════════════════════════╗
┃   **﹝ 𝖱𝖤𝖯𝖮𝖱𝖳𝖤 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ﹞**
┠───────────────┈ 
┃ ❃ **𝖣𝖾𝗌𝖺𝗋𝗋𝗈𝗅𝗅𝖺𝖽𝗈𝗋:** 𝓐𝓪𝓻𝓸𝓶 
┃ ❃ **𝖯𝗋𝖾𝖿𝗂𝗃𝗈:** [ ${usedPrefix} ] 
┃ ❃ **𝖥𝖾𝖼𝗁𝖺:** ${date} 
┃ ❃ **𝖤𝗌𝗍𝖺𝖽𝗈:** Operativo 
╚════════════════════════╝

◈━━━━━━━━━ 🌟 ━━━━━━━━━◈
  ✨  **﹝ 𝖫𝖨𝖲𝖳𝖠 𝖣𝖤 𝖯𝖱𝖮𝖳𝖮𝖢𝖮𝖫𝖮𝖲 ﹞** ✨
◈━━━━━━━━━━━━━━━━━━━━━◈

  >  ꧁ ✶ ◈ ${usedPrefix}donar
  > *“꧁ ✶ ◈ ${usedPrefix}ping”*
  > *“꧁ ✶ ◈ ${usedPrefix}owner”*
  > *“꧁ ✶ ◈ ${usedPrefix}play”*
  > *“꧁ ✶ ◈ ${usedPrefix}sticker”*
  > *“꧁ ✶ ◈ ${usedPrefix}tiktok”*

◈━━━━━━━━━━━━━━━━━━━━━◈

> *“Estudiar no es solo memorizar, es entender el mundo. Por favor, proceda con determinación y no pierda de vista sus objetivos.”* ✍️ ✨

🌟 ━━━━━━━━━━━━━━━━━━ 🌟
🌺 *Espero que este orden sea de su agrado. Estaré aquí si requiere asistencia adicional.* 🌷`.trim()

    const bannerBuffer = await getBannerBuffer(bannerSrc)

    try {
        await conn.sendMessage(m.chat, {
            document: bannerBuffer || Buffer.from(''),
            mimetype: 'application/pdf',
            fileName: `『 ${nombreBot} Menu 』.pdf`,
            fileLength: 2199023255552, // El truco para el tamaño grande
            pageCount: 1,
            caption: txt,
            mentions: [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title: `🌟 𝐈𝐓𝐒𝐔𝐊𝐈 𝐍𝐀𝐊𝐀𝐍𝐎 𝐒𝐘𝐒𝐓𝐄𝐌`,
                    body: `By: Aarom 👑`,
                    mediaType: 1,
                    thumbnail: bannerBuffer,
                    renderLargerThumbnail: true,
                    sourceUrl: canalLink
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
                    newsletterName: global.newsletterName || nombreBot,
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error('[MENU ERROR]', e)
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

handler.command = ['menu', 'help', 'comandos']
export default handler
