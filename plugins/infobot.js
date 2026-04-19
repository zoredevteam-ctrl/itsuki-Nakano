import { database } from '../lib/database.js'
import os from 'os'

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
    
    // Cálculos de Sistema
    const _uptime = process.uptime() * 1000
    const uptime = formatUptime(_uptime)
    const totalreg = Object.keys(database.data?.users || {}).length
    const speed = Math.abs(Date.now() - m.messageTimestamp * 1000)

    const txt = `
👑 ─── 𝖨𝖳𝖲𝖴𝖪𝖨 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖳𝖨𝖮𝖭 ─── 👑

🌷 *Es un placer atenderle. Aquí tiene el registro técnico detallado sobre mi estado actual y configuración de sistema.* ✨

╔════════════════════════╗
┃  🌟 **﹝ 𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ﹞**
┠───────────────┈ ✨
┃ ❃ **𝖢𝗋𝖾𝖺𝖽𝗈𝗋:** 𝓐𝓪𝓻𝓸𝓶 👑
┃ ❃ **𝖢𝗈𝗅𝖺𝖻𝗈𝗋𝖺𝖽𝗈𝗋:** 𝓐𝓪𝓻𝓸𝓶 💎
┃ ❃ **𝖯𝗋𝖾𝖿𝗂𝗃𝗈:** [ ${usedPrefix} ] 🌟
┃ ❃ **𝖴𝗌𝗎𝖺𝗋𝗂𝗈𝗌:** ${totalreg.toLocaleString()} 👥
┃ ❃ **𝖠𝖼𝗍𝗂𝗏𝗈:** ${uptime} ⏳
┃ ❃ **𝖫𝖺𝗍𝖾𝗇𝖼𝗂𝖺:** ${speed}ms ⚡
┃ ❃ **𝖫𝗂𝖻𝗋𝖾𝗋𝗂𝖺:** Baileys v6.6.0 📚
╚════════════════════════╝

◈━━━━━━━━━ 🌟 ━━━━━━━━━◈
  ✨  **﹝ 𝖤𝖲𝖯𝖤𝖢𝖨𝖥𝖨𝖢𝖠𝖢𝖨𝖮𝖭𝖤𝖲 ﹞** ✨
◈━━━━━━━━━━━━━━━━━━━━━◈

    🌷 ◈ **Ram:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / 512MB
    🌺 ◈ **Plataforma:** ${os.platform()}
    👑 ◈ **Zona Horaria:** America/Bogota
    🌟 ◈ **Versión:** 1.0.4 (Itsuki-Update)

◈━━━━━━━━━━━━━━━━━━━━━◈

> *“La información es la base del éxito. Mantener el orden en los datos nos permite avanzar con paso firme hacia nuestras metas.”* ✍️ ✨

🌟 ━━━━━━━━━━━━━━━━━━ 🌟
🌺 *Si requiere más detalles, no dude en consultar mi canal oficial.* 🌷`.trim()

    const bannerBuffer = await getBannerBuffer(bannerSrc)

    try {
        await conn.sendMessage(m.chat, {
            document: bannerBuffer || Buffer.from(''),
            mimetype: 'application/pdf',
            fileName: `『 ${nombreBot} Info 』.pdf`,
            fileLength: 2199023255552, // Truco de imagen grande
            pageCount: 1,
            caption: txt,
            mentions: [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title: `🌟 𝐈𝐓𝐒𝐔𝐊𝐈 𝐍𝐀𝐊𝐀𝐍𝐎 𝐒𝐓𝐀𝐓𝐒`,
                    body: `Developer: 𝓐𝓪𝓻𝓸𝓶 👑`,
                    mediaType: 1,
                    thumbnail: bannerBuffer,
                    renderLargerThumbnail: true,
                    sourceUrl: canalLink
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
                    newsletterName: global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error('[INFOBOT ERROR]', e)
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

handler.help = ['infobot']
handler.tags = ['main']
handler.command = ['infobot', 'status', 'botinfo', 'estado']

export default handler

function formatUptime(ms) {
    let d = Math.floor(ms / (24 * 60 * 60 * 1000))
    let h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    let m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
    let s = Math.floor((ms % (60 * 1000)) / 1000)
    return `${d}d ${h}h ${m}m ${s}s`
}
