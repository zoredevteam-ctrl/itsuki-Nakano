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
    } catch (e) { 
        console.error('Error al cargar banner como Buffer:', e)
        return null 
    }
}

let handler = async (m, { conn, isOwner, isGroup }) => {
    // Verificación de dueño
    if (!isOwner) return m.reply(
        `${moodEmoji[getMood()]} Este comando es exclusivo para mi querido creador, Aarom~ 🙏🌷`
    )

    if (!isGroup) return m.reply(
        `${moodEmoji[getMood()]} Disculpe, este comando solo funciona dentro de un grupo~ 🌷`
    )

    const mood = getMood()
    
    // Despedidas con el estilo Itsuki
    const despedidas = {
        manana: `📚 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 📚\n\nAarom ha solicitado mi retiro. Fue un placer estudiar con ustedes~ 🌺\n\n> ✨ _Procediendo con la extracción del sistema._\n\n¡Que tengan un día muy productivo! 🌷`,
        tarde:  `🍱 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 🍱\n\nAarom me llama de vuelta... espero que hayan comido bien hoy~ 🌺\n\n> ✨ _Procediendo con la extracción del sistema._\n\n¡Hasta pronto! 🌷`,
        noche:  `😴 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 😴\n\nAarom ha solicitado mi retiro. Ya era hora de descansar~ 🌙\n\n> ✨ _Procediendo con la extracción del sistema._\n\n¡Buenas noches a todos! 🌷`,
        madrugada: `😤 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖠𝖫𝖨𝖣𝖠 ─── 😤\n\nAarom me saca del grupo a las ${new Date().getHours()} am... Bueno, supongo que es hora. Hasta luego~ 🌷\n\n> ✨ _Procediendo con la extracción del sistema._`
    }

    const bannerBuffer = await getBanner()

    // ⚠️ SOLUCIÓN CLAVE: Preparamos el AdReply de forma segura
    let externalAd = {
        title:    '👑 𝖨𝖳𝖲𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬',
        body:     'Desconexión iniciada por mi creador supremisimo ✨',
        mediaType: 1,
        sourceUrl: global.rcanal || ''
    }

    // Si el Buffer funcionó, lo usamos. Si falla (por red o error), usamos la URL por defecto para que no crashee.
    if (bannerBuffer) {
        externalAd.thumbnail = bannerBuffer
    } else {
        externalAd.thumbnailUrl = global.banner 
    }

    try {
        await conn.sendMessage(m.chat, {
            text: despedidas[mood] || despedidas.tarde, // Respaldo por si falla el getMood()
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99,
                externalAdReply: externalAd,
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
        // Itsuki se frustra, pero con educación
        await m.reply(`❌ *Disculpe, Aarom.* Ha ocurrido un fallo en mi sistema al intentar retirarme:\n\n\`${e.message}\``)
    }
}

handler.command = ['leave', 'salir', 'abandonar', 'salte']
handler.owner   = true
export default handler
