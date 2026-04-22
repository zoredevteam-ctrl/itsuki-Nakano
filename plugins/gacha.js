/**
 * GACHA - ITSUKI NAKANO
 * #rollwaifu #rw #claim #harem #waifus #charinfo #givechar #robwaifu
 * #haremshop #sell #buycharacter #trade #gachainfo #serielist
 * Z0RT SYSTEMS 🌸
 */

const sendGacha = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `🎴 ${global.botName||'Itsuki Nakano'}`, 'Sistema Gacha')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const normalizeJid = (jid) => jid?.split('@')[0]?.split(':')[0] + '@s.whatsapp.net'

// Base de personajes
const PERSONAJES = [
    // Quintessential Quintuplets
    {nombre:'Itsuki Nakano',   serie:'The Quintessential Quintuplets', rareza:'UR',  poder:98,  img:'https://cdn.myanimelist.net/images/characters/7/388836.jpg'},
    {nombre:'Nino Nakano',     serie:'The Quintessential Quintuplets', rareza:'SSR', poder:92,  img:'https://cdn.myanimelist.net/images/characters/3/388832.jpg'},
    {nombre:'Miku Nakano',     serie:'The Quintessential Quintuplets', rareza:'SSR', poder:90,  img:'https://cdn.myanimelist.net/images/characters/16/388834.jpg'},
    {nombre:'Ichika Nakano',   serie:'The Quintessential Quintuplets', rareza:'SR',  poder:85,  img:'https://cdn.myanimelist.net/images/characters/14/388831.jpg'},
    {nombre:'Yotsuba Nakano',  serie:'The Quintessential Quintuplets', rareza:'SR',  poder:82,  img:'https://cdn.myanimelist.net/images/characters/10/388833.jpg'},
    // Re:Zero
    {nombre:'Rem',             serie:'Re:Zero',          rareza:'SSR', poder:95,  img:'https://cdn.myanimelist.net/images/characters/7/340036.jpg'},
    {nombre:'Ram',             serie:'Re:Zero',          rareza:'SR',  poder:80,  img:'https://cdn.myanimelist.net/images/characters/8/340037.jpg'},
    {nombre:'Emilia',          serie:'Re:Zero',          rareza:'SSR', poder:88,  img:'https://cdn.myanimelist.net/images/characters/10/340038.jpg'},
    // Sword Art Online
    {nombre:'Asuna',           serie:'Sword Art Online', rareza:'SSR', poder:90,  img:'https://cdn.myanimelist.net/images/characters/11/225596.jpg'},
    {nombre:'Sinon',           serie:'Sword Art Online', rareza:'SR',  poder:82,  img:'https://cdn.myanimelist.net/images/characters/7/262785.jpg'},
    // Naruto
    {nombre:'Hinata Hyuga',    serie:'Naruto',           rareza:'SR',  poder:78,  img:'https://cdn.myanimelist.net/images/characters/9/71063.jpg'},
    {nombre:'Sakura Haruno',   serie:'Naruto',           rareza:'SR',  poder:75,  img:'https://cdn.myanimelist.net/images/characters/2/71048.jpg'},
    // My Hero Academia
    {nombre:'Ochaco Uraraka',  serie:'My Hero Academia', rareza:'SR',  poder:80,  img:'https://cdn.myanimelist.net/images/characters/11/335428.jpg'},
    {nombre:'Momo Yaoyorozu',  serie:'My Hero Academia', rareza:'SR',  poder:82,  img:'https://cdn.myanimelist.net/images/characters/15/335432.jpg'},
    {nombre:'Toga Himiko',     serie:'My Hero Academia', rareza:'SSR', poder:88,  img:'https://cdn.myanimelist.net/images/characters/16/356454.jpg'},
    // Attack on Titan
    {nombre:'Mikasa Ackerman', serie:'Attack on Titan',  rareza:'SSR', poder:93,  img:'https://cdn.myanimelist.net/images/characters/9/215563.jpg'},
    {nombre:'Historia Reiss',  serie:'Attack on Titan',  rareza:'SR',  poder:76,  img:'https://cdn.myanimelist.net/images/characters/11/268381.jpg'},
    // Demon Slayer
    {nombre:'Nezuko Kamado',   serie:'Demon Slayer',     rareza:'SSR', poder:91,  img:'https://cdn.myanimelist.net/images/characters/11/404035.jpg'},
    {nombre:'Shinobu Kocho',   serie:'Demon Slayer',     rareza:'SSR', poder:89,  img:'https://cdn.myanimelist.net/images/characters/11/404037.jpg'},
    {nombre:'Kanao Tsuyuri',   serie:'Demon Slayer',     rareza:'SR',  poder:84,  img:'https://cdn.myanimelist.net/images/characters/14/404040.jpg'},
    // Haikyuu
    {nombre:'Koshi Sugawara',  serie:'Haikyuu',          rareza:'R',   poder:65,  img:''},
    // One Punch Man
    {nombre:'Fubuki',          serie:'One Punch Man',    rareza:'SR',  poder:78,  img:''},
    // Generic
    {nombre:'Waifu Misteriosa',serie:'???',              rareza:'UR',  poder:99,  img:'https://api.waifu.pics/sfw/waifu'},
    {nombre:'Dragón Legendario',serie:'???',             rareza:'UR',  poder:100, img:''},
]

const RAREZA_RATE = { UR:0.02, SSR:0.10, SR:0.30, R:0.58 }
const RAREZA_EMOJI = { UR:'🌟', SSR:'💎', SR:'⭐', R:'🍃' }
const RAREZA_COLOR = { UR:'ULTRA RARO', SSR:'SÚPER RARO', SR:'RARO', R:'COMÚN' }

const getRarezaAleatoria = () => {
    const r = Math.random()
    if (r < RAREZA_RATE.UR)  return 'UR'
    if (r < RAREZA_RATE.UR + RAREZA_RATE.SSR) return 'SSR'
    if (r < RAREZA_RATE.UR + RAREZA_RATE.SSR + RAREZA_RATE.SR) return 'SR'
    return 'R'
}

const ensureUser = (db, jid) => {
    if (!db.users) db.users = {}
    if (!db.users[jid]) db.users[jid] = {}
    const u = db.users[jid]
    if (!u.harem)         u.harem = []
    if (!u.gachaCoins)    u.gachaCoins = 100
    if (!u.totalRolls)    u.totalRolls = 0
    if (!u.gachaVentas)   u.gachaVentas = []
    if (!u.claimmsg)      u.claimmsg = '¡Lo conseguí! 🌸'
    return u
}

// Estado global
const personajeActivo = new Map() // chatId → personaje mostrado
const tradePending    = new Map() // targetJid → { de, miChar, suChar }
const CD_ROLL = 3 * 60 * 1000   // 3 minutos entre rolls
const lastRoll = new Map()

let handler = async (m, { conn, command, text, args, db }) => {
    const cmd    = command.toLowerCase()
    const sender = normalizeJid(m.sender)
    const u      = ensureUser(db, sender)
    const name   = m.pushName || sender.split('@')[0]
    const px     = global.prefix || '#'
    const chatId = m.chat

    // ── ROLLWAIFU / RW / ROLL ─────────────────────────────────────────────────
    if (cmd === 'rollwaifu' || cmd === 'rw' || cmd === 'roll') {
        const last = lastRoll.get(chatId) || 0
        const diff = Date.now() - last
        if (diff < CD_ROLL) {
            const rem = Math.ceil((CD_ROLL - diff) / 1000)
            return sendGacha(conn, m, `⏳ Próximo roll en *${rem}s*~ 🌸`)
        }
        const rareza    = getRarezaAleatoria()
        const del_rareza = PERSONAJES.filter(p => p.rareza === rareza)
        const base       = del_rareza.length ? del_rareza[randInt(0, del_rareza.length-1)] : PERSONAJES[randInt(0, PERSONAJES.length-1)]
        const personaje  = { ...base, id: Date.now() }

        personajeActivo.set(chatId, personaje)
        lastRoll.set(chatId, Date.now())

        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `🎴 ${global.botName||'Itsuki Nakano'}`, 'Gacha Roll')

        const caption =
            `🎴 *¡PERSONAJE APARECE!*\n\n` +
            `${RAREZA_EMOJI[rareza]} *${personaje.nombre}*\n` +
            `📺 *${personaje.serie}*\n` +
            `✨ *${rareza}* — ${RAREZA_COLOR[rareza]}\n` +
            `⚔️ Poder: *${personaje.poder}*\n\n` +
            `_Usa *${px}claim* respondiendo este mensaje para reclamarlo~ 🌸_`

        if (personaje.img && !personaje.img.includes('waifu.pics')) {
            await conn.sendMessage(chatId, { image:{ url:personaje.img }, caption, contextInfo:ctx }, { quoted:m })
        } else {
            try {
                const r = await fetch('https://api.waifu.pics/sfw/waifu')
                const j = await r.json()
                await conn.sendMessage(chatId, { image:{ url:j.url||'' }, caption, contextInfo:ctx }, { quoted:m })
            } catch {
                await conn.sendMessage(chatId, { text:caption, contextInfo:ctx }, { quoted:m })
            }
        }
        return
    }

    // ── CLAIM ─────────────────────────────────────────────────────────────────
    if (cmd === 'claim' || cmd === 'c' || cmd === 'reclamar') {
        const activo = personajeActivo.get(chatId)
        if (!activo) return sendGacha(conn, m, `❌ No hay ningún personaje disponible.\n_Usa *${px}rw* para hacer un roll~ 🌸_`)
        if (u.harem.some(p => p.nombre === activo.nombre)) return sendGacha(conn, m,
            `❌ Ya tienes a *${activo.nombre}* en tu harem~`
        )
        personajeActivo.delete(chatId)
        u.harem.push({ ...activo, reclamado: new Date().toLocaleDateString('es-CO') })
        u.totalRolls = (u.totalRolls||0) + 1
        return conn.sendMessage(chatId, {
            text:
                `${RAREZA_EMOJI[activo.rareza]} *¡${name.toUpperCase()} RECLAMÓ A ${activo.nombre.toUpperCase()}!*\n\n` +
                `📺 *${activo.serie}* | ✨ *${activo.rareza}*\n\n` +
                `_"${u.claimmsg}"_`,
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`🎴 ${global.botName||'Itsuki Nakano'}`,'¡Claim!') })())
        }, { quoted: m })
    }

    // ── HAREM / WAIFUS / CLAIMS ───────────────────────────────────────────────
    if (cmd === 'harem' || cmd === 'waifus' || cmd === 'claims') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : sender
        ensureUser(db, target)
        const harem = db.users[target].harem || []
        if (!harem.length) return sendGacha(conn, m, `❌ @${target.split('@')[0]} no tiene personajes aún~`, [target])
        const por_rareza = ['UR','SSR','SR','R'].map(r => {
            const del_r = harem.filter(p=>p.rareza===r)
            return del_r.length ? `${RAREZA_EMOJI[r]} *${r}:* ${del_r.map(p=>p.nombre).join(', ')}` : ''
        }).filter(Boolean).join('\n')
        return sendGacha(conn, m,
            `🎴 *HAREM — @${target.split('@')[0]}*\n\n${por_rareza}\n\n📊 Total: *${harem.length}*`,
            [target]
        )
    }

    // ── CHARINFO / WAIFUINFO ──────────────────────────────────────────────────
    if (cmd === 'charinfo' || cmd === 'winfo' || cmd === 'waifuinfo') {
        const query = (text||'').trim().toLowerCase()
        if (!query) return sendGacha(conn, m, `❌ Uso: *${px}charinfo <nombre>*`)
        const p = PERSONAJES.find(x => x.nombre.toLowerCase().includes(query))
        if (!p) return sendGacha(conn, m, `❌ Personaje no encontrado~`)
        return sendGacha(conn, m,
            `${RAREZA_EMOJI[p.rareza]} *${p.nombre}*\n\n` +
            `📺 Serie: *${p.serie}*\n` +
            `✨ Rareza: *${p.rareza}* — ${RAREZA_COLOR[p.rareza]}\n` +
            `⚔️ Poder: *${p.poder}*\n\n` +
            `_Aparece en el gacha~ 🌸_`
        )
    }

    // ── GIVECHAR / REGALAR ────────────────────────────────────────────────────
    if (cmd === 'givechar' || cmd === 'givewaifu' || cmd === 'regalar') {
        const target   = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        const charName = (text||'').replace(/@\d+/g,'').trim().toLowerCase()
        if (!target || !charName) return sendGacha(conn, m, `🎁 Uso: *${px}givechar @usuario <personaje>*`)
        if (target === sender) return sendGacha(conn, m, `😂 No puedes regalarte a ti mismo~`)
        const idx = u.harem.findIndex(p => p.nombre.toLowerCase().includes(charName))
        if (idx < 0) return sendGacha(conn, m, `❌ No tienes ese personaje~`)
        const personaje = u.harem.splice(idx, 1)[0]
        ensureUser(db, target).harem.push(personaje)
        return conn.sendMessage(chatId, {
            text:
                `🎁 *¡REGALO GACHA!*\n\n` +
                `@${sender.split('@')[0]} regaló *${personaje.nombre}* a @${target.split('@')[0]} 🌸\n` +
                `${RAREZA_EMOJI[personaje.rareza]} *${personaje.rareza}*`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`🎁 ${global.botName||'Itsuki Nakano'}`,'Regalo') })())
        }, { quoted: m })
    }

    // ── ROBWAIFU ──────────────────────────────────────────────────────────────
    if (cmd === 'robwaifu' || cmd === 'robarwaifu') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        if (!target) return sendGacha(conn, m, `🥷 Menciona a alguien para robarle un personaje~`)
        ensureUser(db, target)
        const victHarem = db.users[target].harem || []
        if (!victHarem.length) return sendGacha(conn, m, `😂 @${target.split('@')[0]} no tiene personajes~`, [target])
        if (Math.random() < 0.4) return sendGacha(conn, m, `🚔 ¡Te atraparon intentando robar! Mejor practica más~ 💀`)
        const idx       = randInt(0, victHarem.length - 1)
        const personaje = victHarem.splice(idx, 1)[0]
        u.harem.push(personaje)
        return conn.sendMessage(chatId, {
            text:
                `🥷 *¡ROBO EXITOSO!*\n\n` +
                `@${sender.split('@')[0]} le robó *${personaje.nombre}* a @${target.split('@')[0]} 💀\n` +
                `${RAREZA_EMOJI[personaje.rareza]} *${personaje.rareza}*`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`🥷 ${global.botName||'Itsuki Nakano'}`,'Robo Gacha') })())
        }, { quoted: m })
    }

    // ── SELL / VENDER ─────────────────────────────────────────────────────────
    if (cmd === 'sell' || cmd === 'vender') {
        const precio   = parseInt(args[0]) || 0
        const charName = args.slice(1).join(' ').toLowerCase()
        if (!precio || !charName) return sendGacha(conn, m, `💰 Uso: *${px}sell <precio> <personaje>*`)
        const idx = u.harem.findIndex(p => p.nombre.toLowerCase().includes(charName))
        if (idx < 0) return sendGacha(conn, m, `❌ No tienes ese personaje~`)
        const p = u.harem.splice(idx, 1)[0]
        if (!u.gachaVentas) u.gachaVentas = []
        u.gachaVentas.push({ personaje:p, precio, vendedor:sender, nombre:name })
        return sendGacha(conn, m,
            `🏪 *¡${p.nombre} EN VENTA!*\n\n` +
            `💰 Precio: *${precio} GachaCoins*\n` +
            `${RAREZA_EMOJI[p.rareza]} *${p.rareza}*\n\n` +
            `_Usa *${px}haremshop* para ver la tienda~ 🌸_`
        )
    }

    // ── HAREMSHOP ─────────────────────────────────────────────────────────────
    if (cmd === 'haremshop' || cmd === 'tiendawaifus' || cmd === 'wshop') {
        const items = []
        for (const [jid, u] of Object.entries(db.users||{})) {
            for (const v of (u.gachaVentas||[])) items.push({ ...v, jid })
        }
        if (!items.length) return sendGacha(conn, m, `🏪 La tienda está vacía.\n_Usa *${px}sell* para vender~ 🌸_`)
        const lista = items.slice(0,10).map((v,i) =>
            `${i+1}. ${RAREZA_EMOJI[v.personaje.rareza]} *${v.personaje.nombre}* [${v.personaje.rareza}]\n   💰 *${v.precio} GachaCoins* | De: ${v.nombre}`
        ).join('\n\n')
        return sendGacha(conn, m, `🏪 *TIENDA GACHA*\n\n${lista}\n\n_Usa *${px}buycharacter <número>* para comprar~ 🌸_`)
    }

    // ── BUYCHARACTER ──────────────────────────────────────────────────────────
    if (cmd === 'buycharacter' || cmd === 'buychar' || cmd === 'buyc') {
        const idx   = parseInt(text) - 1
        const items = []
        const keys  = []
        for (const [jid, u] of Object.entries(db.users||{})) {
            for (let i = 0; i < (u.gachaVentas||[]).length; i++) {
                items.push({ jid, idx:i, ...u.gachaVentas[i] })
            }
        }
        if (isNaN(idx)||idx<0||idx>=items.length) return sendGacha(conn, m, `❌ Número inválido~`)
        const item = items[idx]
        if (item.jid === sender) return sendGacha(conn, m, `😂 No puedes comprarte tu propio personaje~`)
        if ((u.gachaCoins||0) < item.precio) return sendGacha(conn, m,
            `❌ No tienes suficiente\n💰 Necesitas: *${item.precio}* | Tienes: *${u.gachaCoins||0}*`
        )
        // Quitar de la venta
        db.users[item.jid].gachaVentas.splice(item.idx, 1)
        u.gachaCoins -= item.precio
        ensureUser(db, item.jid).gachaCoins += item.precio
        u.harem.push(item.personaje)
        return sendGacha(conn, m,
            `✅ *¡COMPRA EXITOSA!*\n\n` +
            `${RAREZA_EMOJI[item.personaje.rareza]} *${item.personaje.nombre}* es tuyo~ 🌸\n` +
            `💰 Pagaste: *${item.precio} GachaCoins*`
        )
    }

    // ── TRADE / INTERCAMBIAR ──────────────────────────────────────────────────
    if (cmd === 'trade' || cmd === 'intercambiar') {
        const parts   = (text||'').split('/')
        const miChar  = parts[0]?.trim().toLowerCase()
        const suChar  = parts[1]?.trim().toLowerCase()
        const target  = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        if (!target||!miChar||!suChar) return sendGacha(conn, m,
            `🔄 Uso: *${px}trade <mi personaje> / <su personaje> @usuario*`
        )
        const miIdx = u.harem.findIndex(p=>p.nombre.toLowerCase().includes(miChar))
        if (miIdx<0) return sendGacha(conn, m, `❌ No tienes ese personaje~`)
        tradePending.set(target, { de:sender, miPers:u.harem[miIdx], suPersName:suChar, timestamp:Date.now() })
        setTimeout(()=>tradePending.delete(target), 60000)
        return conn.sendMessage(chatId, {
            text:
                `🔄 *¡PROPUESTA DE INTERCAMBIO!*\n\n` +
                `@${sender.split('@')[0]} ofrece *${u.harem[miIdx].nombre}*\n` +
                `A cambio de *${suChar}* de @${target.split('@')[0]}\n\n` +
                `_Usa *${px}aceptarint* para aceptar o *${px}rechazarint* para rechazar~ 🌸_`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`🔄 ${global.botName||'Itsuki Nakano'}`,'Trade') })())
        }, { quoted: m })
    }

    if (cmd === 'aceptarint' || cmd === 'aceptarintercambio') {
        const trade = tradePending.get(sender)
        if (!trade) return sendGacha(conn, m, `❌ No tienes ningún intercambio pendiente~`)
        const suIdx = u.harem.findIndex(p=>p.nombre.toLowerCase().includes(trade.suPersName))
        if (suIdx<0) return sendGacha(conn, m, `❌ No tienes el personaje solicitado~`)
        tradePending.delete(sender)
        const deUser = ensureUser(db, trade.de)
        const miIdx  = deUser.harem.findIndex(p=>p.nombre===trade.miPers.nombre)
        if (miIdx<0) return sendGacha(conn, m, `❌ El otro usuario ya no tiene ese personaje~`)
        const suPers = u.harem.splice(suIdx,1)[0]
        const miPers = deUser.harem.splice(miIdx,1)[0]
        u.harem.push(miPers); deUser.harem.push(suPers)
        return sendGacha(conn, m,
            `🔄 *¡INTERCAMBIO COMPLETADO!*\n\n` +
            `@${trade.de.split('@')[0]} → *${miPers.nombre}*\n` +
            `@${sender.split('@')[0]} → *${suPers.nombre}*\n\n` +
            `_¡Intercambio exitoso~ 🌸_`,
            [trade.de, sender]
        )
    }

    if (cmd === 'rechazarint' || cmd === 'rechazarintercambio') {
        const trade = tradePending.get(sender)
        if (!trade) return sendGacha(conn, m, `❌ No tienes ningún intercambio pendiente~`)
        tradePending.delete(sender)
        return sendGacha(conn, m, `❌ Intercambio rechazado~ 🌸`)
    }

    // ── GACHAINFO ─────────────────────────────────────────────────────────────
    if (cmd === 'gachainfo' || cmd === 'ginfo' || cmd === 'infogacha') {
        const ur  = u.harem.filter(p=>p.rareza==='UR').length
        const ssr = u.harem.filter(p=>p.rareza==='SSR').length
        const sr  = u.harem.filter(p=>p.rareza==='SR').length
        const r   = u.harem.filter(p=>p.rareza==='R').length
        return sendGacha(conn, m,
            `🎴 *GACHA INFO — ${name}*\n\n` +
            `💰 GachaCoins: *${u.gachaCoins||0}*\n` +
            `🎲 Total rolls: *${u.totalRolls||0}*\n` +
            `📦 Total personajes: *${u.harem.length}*\n\n` +
            `🌟 UR: *${ur}*\n💎 SSR: *${ssr}*\n⭐