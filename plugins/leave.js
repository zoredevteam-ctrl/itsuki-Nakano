/**
 * LEAVE - ITSUKI NAKANO
 * Comandos: #leave, #salir, #abandonar, #salte
 * Solo owner
 */

const delay = ms => new Promise(r => setTimeout(r, ms))

const getBanner = async () => {
    try {
        const src = global.banner || ''
        if (!src) return null
        if (src.startsWith('data:image')) return Buffer.from(src.split(',')[1], 'base64')
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch (e) { 
        console.error('Error al cargar banner como Buffer:', e)
        return null 
    }
}

let handler = async (m, { conn, isOwner, isGroup }) => {
    // Verificación de dueño
    if (!isOwner) return m.reply(
        `✦ Lo siento, este comando es exclusivo para mi creador, Aarom (⁠✿⁠^⁠‿⁠^⁠) 🌷`
    )

    if (!isGroup) return m.reply(
        `✦ Disculpa, este comando solo funciona dentro de un grupo (⁠◡⁠ ω ◡⁠) 🌸`
    )

    // Despedida única, tierna y con tipografía elegante (sin cursivas)
    const despedida = `╭━━━━〔 𝗔𝗩𝗜𝗦𝗢 𝗗𝗘 𝗦𝗔𝗟𝗜𝗗𝗔 〕━━━━ ✦
┊ Aarom ha solicitado mi retiro de este grupo.
┊ Fue un verdadero placer acompañarlos a todos (⁠✿⁠^⁠‿⁠^⁠)
┊ 
┊ > ✨ 𝘗𝘳𝘰𝘤𝘦𝘥𝘪𝘦𝘯𝘥𝘰 𝘤𝘰𝘯 𝘭𝘢 𝘦𝘹𝘵𝘳𝘢𝘤𝘤𝘪𝘰́𝘯 𝘥𝘦𝘭 𝘴𝘪𝘴𝘵𝘦𝘮𝘢...
┊
┊ ¡Que tengan un hermoso día! 🌷
╰━━━━━━━━━━━━━━━━━━━━━━ ✦`

    const bannerBuffer = await getBanner()

    // Preparando el AdReply con el nuevo estilo
    let externalAd = {
        title:    '👑 𝗜𝗧𝗦𝗨𝗞𝗜 𝗦𝗬𝗦𝗧𝗘𝗠 👑',
        body:     'Desconexión iniciada por mi creador Aarom ✨',
        mediaType: 1,
        sourceUrl: global.rcanal || ''
    }

    if (bannerBuffer) {
        externalAd.thumbnail = bannerBuffer
    } else {
        externalAd.thumbnailUrl = global.banner 
    }

    try {
        await conn.sendMessage(m.chat, {
            text: despedida,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99,
                externalAdReply: externalAd,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
                    newsletterName:  global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝐔𝐩𝐝𝐚𝐭𝐞𝐬 ✧ 𓆪',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })

        await delay(2500)
        await conn.groupLeave(m.chat)

    } catch (e) {
        console.error('[LEAVE ERROR]', e)
        await m.reply(`❌ ✦ Ay, ocurrió un pequeño error en mi sistema al intentar salir, Aarom:\n\n\`${e.message}\` (⁠｡⁠•́⁠︿⁠•̀⁠｡⁠)`)
    }
}

handler.command = ['leave', 'salir', 'abandonar', 'salte']
handler.owner   = true
export default handler
