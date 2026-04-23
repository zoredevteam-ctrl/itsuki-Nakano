/**
 * MENU - NINO NAKANO
 * Comandos: #menu, #help, #comandos
 * Creado por Aarom y Félix
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
    const nombreBot = global.botName || 'Nino Nakano'
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
    const users    = dbData.users   || {}
    const subbots  = dbData.subbots || {}
    const totalreg = Object.keys(users).length
    const totalSub = Object.keys(subbots).filter(k => subbots[k]?.connected).length

    // ── DATOS DEL USUARIO ─────────────────────────────────────────────────────
    const userData    = users[sender] || {}
    const userMoney   = (userData.money  || 0).toLocaleString()
    const userBank    = (userData.bank   || 0).toLocaleString()
    const userExp     = (userData.exp    || 0).toLocaleString()
    const userLevel   = userData.level   || 1
    const userRep     = userData.reputacion || 0
    const userAmigos  = (userData.amigos || []).length
    const userTrofeos = (userData.trofeos|| []).length
    const userHP      = userData.hp      || 100
    const userMaxHP   = userData.maxHp   || 100
    const userPokemon = (userData.pokemon|| []).length
    const userHarem   = (userData.harem  || []).length

    const getRango = (lvl) => {
        if (lvl >= 50) return '✦ Leyenda'
        if (lvl >= 30) return '✧ Diamante'
        if (lvl >= 20) return '✩ Oro'
        if (lvl >= 10) return '✪ Plata'
        if (lvl >= 5)  return '✫ Bronce'
        return '◈ Novato'
    }
    const rango = getRango(userLevel)

    const sortedUsers = Object.entries(users)
        .map(([jid, u]) => ({ jid, total: (u.money || 0) + (u.bank || 0) }))
        .sort((a, b) => b.total - a.total)
    const rankPos  = sortedUsers.findIndex(u => u.jid === sender) + 1
    const rankText = rankPos > 0 ? `#${rankPos} de ${totalreg}` : 'Sin ranking'

    const px = usedPrefix || global.prefix || '#'

    // ── TEXTO ─────────────────────────────────────────────────────────────────
    const txt = `
『 𝐇𝐨𝐥𝐚 ${username} 』(✿◠‿◠)

Soy *${nombreBot}*, es un gusto verte por aquí.
Espero que estés teniendo una linda ${moment}. ( ˶ˆ 弹性 ˆ˵ )

─── ❖ ── ✦ ── ❖ ───
「 𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 」
◈ Desarrollado por: *𝓐𝓪𝓻𝓸𝓶*
◈ Prefijo: ﹝ ${px} ﹞
◈ Fecha: ${date}
◈ Estado: Operativo (ꈍᴗꈍ)
─── ❖ ── ✦ ── ❖ ───

> ⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆
> ↬ ${nombreBot} es un bot privado.
> ↬ El bot principal no se une a grupos.
> ↬ Para tenerlo usa ${px}code y sé Sub‑Bot.
> ⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆

『 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 』
✦ Usuarios: ${totalreg.toLocaleString()}
✦ Sub‑Bots: ${totalSub} / 30
✦ Uptime: ${uptime}
✦ Ping: ${p}

『 𝐈𝐍𝐅𝐎 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 』
✧ Nombre: ${username}
✧ Coins: ${userMoney} 
✧ Banco: ${userBank} 
✧ Exp: ${userExp} 
✧ Rango: ${rango}
✧ Nivel: ${userLevel}
✧ Top: ${rankText}
✧ HP: [████████▒▒] ${userHP}/${userMaxHP}
✧ Reputación: ${userRep}
✧ Amigos: ${userAmigos}
✧ Trofeos: ${userTrofeos}
✧ Pokémon: ${userPokemon}
✧ Harem: ${userHarem}
─── ❖ ── ✦ ── ❖ ───

『 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 』

❀ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 (｡◕‿◕｡)
↬ ${px}ping ┊ latencia del bot
↬ ${px}menu ┊ abre este menú
↬ ${px}owner ┊ info de creadores
↬ ${px}leave ┊ el bot sale del grupo

❀ 𝐌𝐎𝐃𝐄𝐑𝐀𝐂𝐈𝐎́𝐍 (－‸－)
↬ ${px}warn / ${px}resetwarn / ${px}warns
↬ ${px}mute [tiempo] / ${px}unmute
↬ ${px}tempban @usuario [tiempo]
↬ ${px}closegroup / ${px}opengroup
↬ ${px}antilink / ${px}antispam
↬ ${px}welcome on/off

❀ 𝐆𝐑𝐔𝐏𝐎𝐒 ( ◡‿◡ *)
↬ ${px}kick / ${px}ban / ${px}add
↬ ${px}tag / ${px}promover / ${px}degradar
↬ ${px}admins / ${px}link / ${px}revoke
↬ ${px}gpname / ${px}gpdesc / ${px}gpbanner
↬ ${px}del / ${px}gp / ${px}inactivos

❀ 𝐄𝐂𝐎𝐍𝐎𝐌𝐈́𝐀 𝐁𝐀𝐒𝐄 ٩(◕‿◕)۶
↬ ${px}chamba ┊ sirve para trabajar y ganar coins (✿◠‿◠)
↬ ${px}daily ┊ reclama tu premio diario
↬ ${px}work / ${px}minar
↬ ${px}crime / ${px}pesca / ${px}mendigo
↬ ${px}rob / ${px}slots / ${px}casino
↬ ${px}depositar / ${px}retirar
↬ ${px}bal / ${px}top / ${px}lvl
↬ ${px}donar / ${px}addcoins _(owner)_

❀ 𝐄𝐂𝐎𝐍𝐎𝐌𝐈́𝐀 𝐀𝐕𝐀𝐍𝐙𝐀𝐃𝐀 ✦
↬ ${px}weekly / ${px}monthly
↬ ${px}aventura / ${px}cazar / ${px}curar
↬ ${px}coinflip / ${px}roulette
↬ ${px}prestamo / ${px}pagar
↬ ${px}invertir / ${px}loteria
↬ ${px}mercado / ${px}compraraccion
↬ ${px}venderaccion / ${px}misacciones
↬ ${px}robarexp / ${px}einfo / ${px}pay

❀ 𝐑𝐏𝐆 ⚔︎
↬ ${px}clases / ${px}elegirclase
↬ ${px}rpgperfil / ${px}dungeon
↬ ${px}atacar / ${px}habilidad
↬ ${px}curar / ${px}rpgtop

❀ 𝐉𝐔𝐄𝐆𝐎𝐒 ✧
↬ ${px}trivia / ${px}adivina / ${px}pista
↬ ${px}rendirse / ${px}rruleta
↬ ${px}ahorcado / ${px}ppt / ${px}dados
↬ ${px}moneda / ${px}acertijo
↬ ${px}blackjack / ${px}pedir / ${px}plantarse

❀ 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 ◓
↬ ${px}pokemon / ${px}atrapar
↬ ${px}mypoke / ${px}pokeinfo
↬ ${px}pokepvp / ${px}pvp
↬ ${px}sellpoke / ${px}pokeshop / ${px}buypoke
↬ ${px}curarpokemon / ${px}regalarpokemon
↬ ${px}historial / ${px}poketop / ${px}toppower

❀ 𝐆𝐀𝐂𝐇𝐀 (〃￣ω￣〃)
↬ ${px}rw / ${px}roll / ${px}rollwaifu
↬ ${px}claim / ${px}harem / ${px}waifus
↬ ${px}charinfo / ${px}charimage
↬ ${px}givechar / ${px}robwaifu
↬ ${px}sell / ${px}haremshop / ${px}buycharacter
↬ ${px}trade / ${px}aceptarint / ${px}rechazarint

❀ 𝐒𝐎𝐂𝐈𝐀𝐋 ♡
↬ ${px}casar / ${px}aceptar / ${px}divorcio
↬ ${px}adoptar / ${px}duelo / ${px}carta
↬ ${px}confesar / ${px}amistad / ${px}regalo
↬ ${px}cumpleanos / ${px}rep / ${px}verificar
↬ ${px}miperfil / ${px}trofeos / ${px}bio

❀ 𝐀𝐍𝐈𝐌𝐄 & 𝐑𝐄𝐀𝐂𝐂𝐈𝐎𝐍𝐄𝐒 ✩
↬ ${px}kiss / ${px}hug / ${px}kill
↬ ${px}push / ${px}dormir / ${px}triste
↬ ${px}pat / ${px}neko / ${px}waifu
↬ ${px}husbando / ${px}quoteanime
↬ ${px}buscaranime / ${px}personaje

❀ 𝐈𝐀 & 𝐂𝐑𝐄𝐀𝐓𝐈𝐕𝐈𝐃𝐀𝐃 ⌨
↬ ${px}ia / ${px}chat / ${px}gpt
↬ ${px}poema / ${px}historia / ${px}consejo
↬ ${px}roast / ${px}completar / ${px}traducirx
↬ ${px}clearchat

❀ 𝐈𝐀 𝐃𝐈𝐀𝐋𝐄𝐂𝐓𝐎𝐒 (O_O)
↬ ${px}nino ┊ _(español neutro)_
↬ ${px}ninope ┊ _(peruana)_
↬ ${px}ninoar ┊ _(argentina)_
↬ ${px}ninomex ┊ _(mexicana)_
↬ ${px}ninopaisa ┊ _(paisa)_
↬ ${px}ninoco ┊ _(colombiana)_

❀ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈𝐎́𝐍 ◈
↬ ${px}crypto / ${px}moneda / ${px}cambio
↬ ${px}ip / ${px}color / ${px}pais
↬ ${px}definir / ${px}tiempo / ${px}hora
↬ ${px}pokedex / ${px}pokemon

❀ 𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀𝐒 
↬ ${px}clima / ${px}traducir / ${px}calc
↬ ${px}qr / ${px}wiki / ${px}chiste / ${px}frase
↬ ${px}getpic / ${px}say / ${px}ssweb
↬ ${px}ytsearch / ${px}google
↬ ${px}letra / ${px}read

❀ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 ↧
↬ ${px}play / ${px}playvid
↬ ${px}enviartt <url tiktok>

❀ 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ✦
↬ ${px}s / ${px}sticker / ${px}toimg

❀ 𝐒𝐔𝐁‑𝐁𝐎𝐓𝐒 ↬
↬ ${px}code <número>
↬ ${px}subbots / ${px}delsubbot
↬ ${px}setnombre / ${px}setbanner

─── ❖ ── ✦ ── ❖ ───
> ✦ Bot en fase alpha, se espera que haya errores que se irán solucionando.
> ✦ Power by 𝓐𝓪𝓻𝓸𝓶 ✦
`.trim()

    // ── ENVIAR (PDF falso) ────────────────────────────────────────────────────
    const bannerBuffer = await getBannerBuffer(bannerSrc)

    try {
        await conn.sendMessage(m.chat, {
            document:   bannerBuffer || Buffer.from(''),
            mimetype:   'application/pdf',
            fileName:   `『 ${nombreBot} Menu 』.pdf`,
            fileLength: 2199023255552,
            pageCount:  1,
            caption:    txt,
            mentions:   [m.sender],
            contextInfo: {
                isForwarded:     true,
                forwardingScore: 999,
                externalAdReply: {
                    title:                 `✦ 𝐍𝐈𝐍𝐎 𝐍𝐀𝐊𝐀𝐍𝐎 𝐒𝐘𝐒𝐓𝐄𝐌 ✦`,
                    body:                  `By: 𝓐𝓪𝓻𝓸𝓶 ✦`,
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
