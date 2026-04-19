/**
 * MENU - ITSUKI NAKANO
 * Comandos: #menu, #help, #comandos
 * Z0RT SYSTEMS 🌸
 */

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

let handler = async (m, { conn, usedPrefix, db }) => {
    const nombreBot = global.botName || 'Itsuki Nakano'
    const bannerSrc = global.banner  || ''
    const canalLink = global.rcanal || ''

    const sender = (m.sender || '')
        .replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '')
        .split('@')[0].split(':')[0] + '@s.whatsapp.net'

    const username = m.pushName || 'Usuario'

    // ── FECHA ─────────────────────────────────────────────────────────────────
    const now  = new Date()
    const date = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(now)

    const hora   = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', hour12: false }).format(now)
    const h      = parseInt(hora)
    const moment = h < 12 ? 'mañana' : h < 18 ? 'tarde' : 'noche'

    // ── UPTIME ────────────────────────────────────────────────────────────────
    const uptimeSec = Math.floor(process.uptime())
    const ud = Math.floor(uptimeSec / 86400)
    const uh = Math.floor((uptimeSec % 86400) / 3600)
    const um = Math.floor((uptimeSec % 3600) / 60)
    const us = uptimeSec % 60
    const uptime = ud > 0 ? `${ud}d ${uh}h ${um}m` : uh > 0 ? `${uh}h ${um}m ${us}s` : `${um}m ${us}s`

    // ── PING ──────────────────────────────────────────────────────────────────
    const pingStart = Date.now()
    const p         = (Date.now() - pingStart) + ' ms'

    // ── DATOS GLOBALES ────────────────────────────────────────────────────────
    const dbData   = db || database.data || {}
    const users    = dbData.users  || {}
    const subbots  = dbData.subbots || {}
    const totalreg = Object.keys(users).length
    const totalSub = Object.keys(subbots).filter(k => subbots[k]?.connected).length

    // ── DATOS DEL USUARIO ─────────────────────────────────────────────────────
    const userData  = users[sender] || {}
    const userMoney = (userData.money || userData.limit || 0).toLocaleString()
    const userBank  = (userData.bank  || 0).toLocaleString()
    const userExp   = (userData.exp   || 0).toLocaleString()
    const userLevel = userData.level  || 1

    const getRango = (lvl) => {
        if (lvl >= 50) return '🏆 Leyenda'
        if (lvl >= 30) return '💎 Diamante'
        if (lvl >= 20) return '🥇 Oro'
        if (lvl >= 10) return '🥈 Plata'
        if (lvl >= 5)  return '🥉 Bronce'
        return '🌱 Novato'
    }
    const rango = getRango(userLevel)

    const sortedUsers = Object.entries(users)
        .map(([jid, u]) => ({ jid, total: (u.money || u.limit || 0) + (u.bank || 0) }))
        .sort((a, b) => b.total - a.total)
    const rankPos  = sortedUsers.findIndex(u => u.jid === sender) + 1
    const rankText = rankPos > 0 ? `#${rankPos} de ${totalreg}` : 'Sin ranking'

    // ── PREFIJO ───────────────────────────────────────────────────────────────
    const px = usedPrefix || global.prefix || '#'

    // ── TEXTO ─────────────────────────────────────────────────────────────────
    const txt = `
╔══════════════╗
   ✦ 𝐈𝐓𝐒𝐔𝐊𝐈 𝐍𝐀𝐊𝐀𝐍𝐎 ✦
 « 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐅𝐥𝐨𝐫𝐚𝐥 𝐄𝐥𝐞𝐠𝐚𝐧𝐭𝐞 »
╚════ ❀ 💫 ❀ ════╝

👑 *¡𝐇𝐨𝐥𝐚! ${username}.*
Soy *${nombreBot}*, es un gusto verte de nuevo.
Espero que estés teniendo una *linda ${moment}*.
He preparado este panel especialmente para ti,
con el mismo cuidado con el que estudio mis lecciones.

╔════ ❀ 𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ❀ ════╗
• Desarrollado por *𝓐𝓪𝓻𝓸𝓶* 👑
• Prefijo: [ ${px} ]
• Fecha: ${date}
• Estado: Operativo ✨
╚════ ❀ 🤍 ❀ ════╝

> ꒰⌢ ʚ˚₊‧ ✎ ꒱ 𝐈𝐍𝐅𝐎:
- ${nombreBot} es un bot privado.
- El bot principal *no se une a grupos*.
- Para tenerlo usa *${px}code* y sé Sub‑Bot.
> ꒰⌢ ʚ˚₊‧ ✎ ꒱ ❐

╔════ ❀ 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 ❀ ════╗
• Creador: Aarom 👑
• Usuarios: ${totalreg.toLocaleString()}
• Sub‑Bots: ${totalSub} / 30
• Uptime: ${uptime}
• Ping: ${p}
╚════ ❀ 🤍 ❀ ════╝

╔════ ❀ 𝐈𝐍𝐅𝐎 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❀ ════╗
• Nombre: ${username}
• Coins: ${userMoney} 💰
• Banco: ${userBank} 🏦
• Exp: ${userExp} ✨
• Rango: ${rango}
• Nivel: ${userLevel}
• Top: ${rankText}
╚════ ❀ 🌷 ❀ ════╝

╔ ❀ 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 ❀ ╗

❀ *SISTEMA*
> ➜ ${px}ping / ${px}menu / ${px}help
> ➜ ${px}owner / ${px}infobot
> ➜ ${px}boton / ${px}botoff
> ➜ ${px}modoadmin / ${px}modoowner
> ➜ ${px}report / ${px}bug

❀ *MODERACIÓN* 
> ➜ ${px}warn / ${px}resetwarn / ${px}warns
> ➜ ${px}mute [tiempo] / ${px}unmute
> ➜ ${px}tempban @usuario [tiempo]
> ➜ ${px}closegroup / ${px}opengroup
> ➜ ${px}antilink / ${px}antispam
> ➜ ${px}setprimary / ${px}removeprimary
> ➜ ${px}welcome on/off
> ➜ ${px}nsfw on/off
> ➜ ${px}setedad / ${px}edadoff
> ➜ ${px}cartaon / ${px}cartaoff

❀ *GRUPOS* 
> ➜ ${px}kick / ${px}ban
> ➜ ${px}tag / ${px}promover / ${px}degradar

❀ *ECONOMÍA* 
> ➜ ${px}daily / ${px}diario
> ➜ ${px}cofre / ${px}chest
> ➜ ${px}work / ${px}trabajar / ${px}chamba
> ➜ ${px}minar / ${px}mine
> ➜ ${px}crime / ${px}crimen
> ➜ ${px}pesca / ${px}pescar / ${px}fish
> ➜ ${px}mendigo / ${px}pedir / ${px}beg
> ➜ ${px}rob / ${px}robar
> ➜ ${px}slots / ${px}casino / ${px}ruleta
> ➜ ${px}depositar / ${px}deposit
> ➜ ${px}retirar / ${px}withdraw
> ➜ ${px}bal / ${px}balance / ${px}saldo
> ➜ ${px}top / ${px}ranking / ${px}baltop
> ➜ ${px}lvl / ${px}nivel / ${px}level
> ➜ ${px}donar / ${px}dar / ${px}transfer
> ➜ ${px}prestamo / ${px}pagar / ${px}invertir
> ➜ ${px}addcoins / ${px}addexp _(owner)_

❀ *RPG* 
> ➜ ${px}clases / ${px}elegirclase
> ➜ ${px}perfil / ${px}dungeon
> ➜ ${px}atacar / ${px}habilidad
> ➜ ${px}curar / ${px}inventario / ${px}usar
> ➜ ${px}pelear / ${px}tiendarpg
> ➜ ${px}clan / ${px}misiones / ${px}reclamar
> ➜ ${px}rpgtop

❀ *JUEGOS* 
> ➜ ${px}trivia / ${px}triviatop
> ➜ ${px}adivina / ${px}pista / ${px}rendirse
> ➜ ${px}rruleta

❀ *SOCIAL* 
> ➜ ${px}casar / ${px}aceptar / ${px}divorcio
> ➜ ${px}adoptar
> ➜ ${px}duelo / ${px}aceptarduelo
> ➜ ${px}carta / ${px}verificar

❀ *ANIME & REACCIONES* 
> ➜ ${px}rw / ${px}miswaifu
> ➜ ${px}kiss / ${px}hug / ${px}kill
> ➜ ${px}push / ${px}dormir / ${px}triste
> ➜ ${px}no / ${px}hola / ${px}borracho
> ➜ ${px}neko / ${px}waifu / ${px}pat

❀ *IA & CREATIVIDAD* 
> ➜ ${px}ia <pregunta>
> ➜ ${px}imagen <descripción>

❀ *MÍSTICA* 
> ➜ ${px}horoscopo <signo>
> ➜ ${px}tarot / ${px}prediccion

❀ *ESTADÍSTICAS* 
> ➜ ${px}topgrupo / ${px}rankgrupo
> ➜ ${px}miperfil / ${px}miactividad

❀ *HERRAMIENTAS* 
> ➜ ${px}clima <ciudad>
> ➜ ${px}traducir <idioma> <texto>
> ➜ ${px}calc / ${px}qr / ${px}wiki
> ➜ ${px}pokedex / ${px}chiste / ${px}frase

❀ *DESCARGAS* 
> ➜ ${px}play / ${px}playvid
> ➜ ${px}letra / ${px}pin
> ➜ ${px}enviartt <url tiktok>

❀ *STICKERS* 
> ➜ ${px}s / ${px}sticker

❀ *SUB‑BOTS* 
> ➜ ${px}code <número>
> ➜ ${px}subbots / ${px}delsubbot
> ➜ ${px}setnombre / ${px}setbanner

╚════ ❀ 🌟 ❀ ════╝

🌸 *"El conocimiento florece cuando se cultiva
con paciencia y constancia."* ✍️✨

🌺 *Si necesitas algo más, estaré aquí para ayudarte.*
`.trim()

    // ── ENVIAR (PDF falso — funciona en todos los WhatsApp) ───────────────────
    const bannerBuffer = await getBannerBuffer(bannerSrc)

    try {
        await conn.sendMessage(m.chat, {
            document:  bannerBuffer || Buffer.from(''),
            mimetype:  'application/pdf',
            fileName:  `『 ${nombreBot} Menu 』.pdf`,
            fileLength: 2199023255552,
            pageCount: 1,
            caption:   txt,
            mentions:  [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title:                 `🌟 𝐈𝐓𝐒𝐔𝐊𝐈 𝐍𝐀𝐊𝐀𝐍𝐎 𝐒𝐘𝐒𝐓𝐄𝐌`,
                    body:                  `By: Aarom 👑`,
                    mediaType:             1,
                    thumbnail:             bannerBuffer,
                    renderLargerThumbnail: true,
                    sourceUrl:             canalLink
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
                    newsletterName:  global.newsletterName || nombreBot,
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error('[MENU ERROR]', e.message)
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

handler.command = ['menu', 'help', 'comandos']
export default handler