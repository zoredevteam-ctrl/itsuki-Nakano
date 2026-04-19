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
╔══════════════╗
   ✦ 𝐈𝐓𝐒𝐔𝐊𝐈 𝐍𝐀𝐊𝐀𝐍𝐎 ✦
 « 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐅𝐥𝐨𝐫𝐚𝐥 𝐄𝐥𝐞𝐠𝐚𝐧𝐭𝐞 »
╚════ ❀ 💫 ❀ ════╝

 *Hola ${username}.*  
Soy **${nombreBot}**, es un gusto verte de nuevo.  
Espero que estés teniendo una **linda ${moment}**.  
He preparado este panel especialmente para ti,  
con el mismo cuidado con el que estudio mis lecciones.

╔════ ❀ 𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ❀ ════╗
• Este panel está controlado por **Aarom**  
• Prefijo: [ ${usedPrefix} ]  
• Fecha: ${date}  
• Estado: Operativo ✨  
╚════ ❀ 🤍 ❀ ════╝

> ꒰⌢ ʚ˚₊‧ ✎ ꒱ 𝐈𝐍𝐅𝐎:
- ${nombreBot} es un bot privado.  
- El bot principal **no se unirá a grupos**.  
- Para tenerlo en tu grupo debes ser *Sub‑Bot* usando **#code**.
> ꒰⌢ ʚ˚₊‧ ✎ ꒱ ❐ ʚ˚₊‧ʚ˚₊‧ʚ˚

╔════ ❀ 𝐁𝐎𝐓 - 𝐈𝐍𝐅𝐎 ❀ ════╗
• Creador: Aarom  
• Usuarios: ${totalreg.toLocaleString()}  
• Uptime: ${uptime}  
• Ping: ${p}  
• Baileys: Sistema interno  
• Comandos: https://  
╚════ ❀ 🤍 ❀ ════╝

╔════ ❀ 𝐈𝐍𝐅𝐎 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❀ ════╗
• Nombre: ${username}  
• ${currency}: ${userMoney}  
• Exp: ${userExp}  
• Rango: ${rango}  
• Nivel: ${userLevel}  
• Top: ${rankText}  
╚════ ❀ 🌷 ❀ ════╝

╔════ ❀ 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 ❀ ════╗

> ➜ ${usedPrefix}p  
> ➜ ${usedPrefix}ping  
> ➜ ${usedPrefix}menu  
> ➜ ${usedPrefix}help  
> ➜ ${usedPrefix}owner  

╚════ ❀ 🌟 ❀ ════╝

🌸 *“El conocimiento florece cuando se cultiva  
con paciencia y constancia.”* ✍️✨

🌺 *Si necesitas algo más, estaré aquí para ayudarte.*  
`.trim()

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