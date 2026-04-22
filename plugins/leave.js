/**
 * LEAVE - ITSUKI NAKANO
 * Comandos: #leave, #salir, #abandonar, #salte
 * Solo owner
 */

import { getMood, moodEmoji } from './itsuki_mood.js'

const delay = ms => new Promise(r => setTimeout(r, ms))

const getBanner = async () => {
    try {
        const src = global.banner || ''
        if (!src) return null
        if (src.startsWith('data:image')) return Buffer.from(src.split(',')[1], 'base64')
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn, isOwner, isGroup }) => {
    // ✅ FIX: usar isOwner del handler, no m.isOwner
    if (!isOwner) return m.reply(
        `${moodEmoji[getMood()]} Este comando es solo para mí hermoso creador~ 🙏🍀`
    )

    if (!isGroup) return m.reply(
        `${moodEmoji[getMood()]} Este comando solo funciona dentro de un grupo~ 🍀`
    )

    const mood = getMood()
    const despedidas = {
        manana: `📚 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 📚\n\nAarom ha solicitado mi retiro. Fue un placer estudiar con ustedes~ 🌺\n\n> ✨ _Procediendo con la extracción del sistema._\n\n¡Que tengan un día muy productivo! 🍀`,
        tarde:  `🍱 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 🍱\n\nAarom me llama de vuelta... espero que hayan comido bien hoy~ 🌺\n\n> ✨ _Procediendo con la extracción del sistema._\n\n¡Hasta pronto! 🍀`,
        noche:  `😴 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 😴\n\nAarom ha solicitado mi retiro. Ya era hora de descansar~ 🌙\n\n> ✨ _Procediendo con la extracción del sistema._\n\n¡Buenas noches a todos! 🍀`,
        madrugada: `😤 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 😤\n\nAarom me saca del grupo a las ${new Date().getHours()}am... Bueno. Hasta luego~ 🍀\n\n> ✨ _Procediendo con la extracción del sistema._`
    }

    const bannerBuffer = await getBanner()

    try {
        await conn.sendMessage(m.chat, {
            text: despedidas[mood],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99,
                externalAdReply: {
                    title:    '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
                    body:     'Desconexión iniciada por mi creador supremisimo✨',
                    mediaType: 1,
                    // ✅ thumbnail como Buffer, no thumbnailUrl
                    thumbnail: bannerBuffer,
                    sourceUrl: global.rcanal || ''
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
                    newsletterName:  global.newsletterName || '𓆩 ✧ 𝐈𝐭𝐬𝐮𝐤𝐢 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })

        await delay(2500)
        await conn.groupLeave(m.chat)

    } catch (e) {
        console.error('[LEAVE ERROR]', e)
        await m.reply(`❌ que mierdasaaaa~ 😠😠\nError: ${e.message}`)
    }
}

handler.command = ['leave', 'salir', 'abandonar', 'salte']
handler.owner   = true
export default handler