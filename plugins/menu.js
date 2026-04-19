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
> ╔══════════════╗
>    ✦ 𝐈𝐓𝐒𝐔𝐊𝐈 ✦
>  « 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐅𝐥𝐨𝐫𝐚𝐥 »
> ╚════ ❀ 🌸 ❀ ════╝

> 🌸 *Bienvenido, ${username}.*  
> He preparado este panel con dedicación,  
> como cuando estudio con calma y disciplina.

> ╔════ ❀ 𝐈𝐍𝐅𝐎 ❀ ════╗
> • Desarrollador: 𝓐𝓪𝓻𝓸𝓶  
> • Prefijo: [ ${usedPrefix} ]  
> • Fecha: ${date}  
> • Estado: Estable ✨  
> ╚════ ❀ 🌸 ❀ ════╝

> ╔════ ❀ 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 ❀ ════╗
> ➜ ${usedPrefix}donar  
> ➜ ${usedPrefix}ping  
> ➜ ${usedPrefix}owner  
> ➜ ${usedPrefix}play  
> ➜ ${usedPrefix}sticker  
> ➜ ${usedPrefix}tiktok 
> ➜ ${usedPrefix}infobot  
> ╚════ ❀ 🌸 ❀ ════╝

> 🌸 *“El conocimiento florece cuando se cultiva  
> con paciencia y constancia.”* ✍️✨

> 🌺 *Si necesita más ayuda, estaré aquí para guiarle.*  
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
                    body: `By: 𝓐𝓪𝓻𝓸𝓶 👑`,
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