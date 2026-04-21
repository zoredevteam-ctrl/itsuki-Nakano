/**
 * ECONOMÍA AVANZADA - ITSUKI NAKANO
 * #prestamo #pagar #invertir #loteria #mercado #robarexp #baltop
 * Z0RT SYSTEMS 🌸
 */

const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const formatN  = (n) => { try { const v=parseInt(n)||0; if(v>=1_000_000)return(v/1_000_000).toFixed(1)+'M'; if(v>=1_000)return(v/1_000).toFixed(1)+'k'; return v.toLocaleString() } catch { return String(n||0) } }
const toMs     = (h=0,m=0,s=0) => ((h*3600)+(m*60)+s)*1000
const CD1M     = toMs(0,1,0)
const CD24H    = toMs(24,0,0)

const ensureUser = (db, jid) => {
    if (!db.users)      db.users = {}
    if (!db.users[jid]) db.users[jid] = {}
    const d = { money:0,bank:0,exp:0,level:1,wins:0,prestamo:0,ultimoInvert:0,ultimoLoteria:0,ultimoMercado:0,ultimoRobExp:0,acciones:{} }
    for(const[k,v]of Object.entries(d)) if(db.users[jid][k]===undefined) db.users[jid][k]=v
    return db.users[jid]
}

const sendEco2 = async (conn, m, text, mentions=[]) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `💰 ${global.botName||'Itsuki Nakano'}`, 'Economía Avanzada')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

// Acciones del mercado
const ACCIONES = [
    { id:'sakura', nombre:'🌸 Sakura Corp',   base:100, volatilidad:0.3 },
    { id:'katana', nombre:'⚔️ Katana Tech',  base:250, volatilidad:0.5 },
    { id:'ramen',  nombre:'🍜 Ramen Group',   base:50,  volatilidad:0.2 },
    { id:'anime',  nombre:'📺 AnimeStream',   base:150, volatilidad:0.4 },
    { id:'mochi',  nombre:'🍡 Mochi Foods',   base:80,  volatilidad:0.35 }
]

const getPrecio = (accion) => {
    const variacion = 1 + (Math.random() * 2 - 1) * accion.volatilidad
    return Math.max(10, Math.floor(accion.base * variacion))
}

let handler = async (m, { conn, command, text, args, isOwner, db }) => {
    const cmd    = command.toLowerCase()
    const sender = (m.sender||'').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/,'').split('@')[0]+'@s.whatsapp.net'
    const u      = ensureUser(db, sender)
    const now    = Date.now()
    const px     = global.prefix || '#'
    const currency = 'Flores'

    const onCD = (key, tiempo, nombre) => {
        const diff = now-(u[key]||0)
        if(diff<tiempo){ sendEco2(conn,m,`⏳ Espera *${Math.floor((tiempo-diff)/1000)}s* para usar *${nombre}* de nuevo~ 🌸`); return true }
        return false
    }

    // ── PRÉSTAMO ──────────────────────────────────────────────────────────────
    if (cmd === 'prestamo') {
        if ((u.prestamo||0) > 0) return sendEco2(conn, m,
            `💳 Ya tienes un préstamo pendiente de *${formatN(u.prestamo)} ${currency}*\n_Usa *${px}pagar* para pagarlo primero~ 🌸`
        )
        const amount = parseInt(args[0]) || 0
        if (!amount || amount <= 0) return sendEco2(conn, m,
            `💳 *PRÉSTAMO ITSUKI*\n\nUso: *${px}prestamo <cantidad>*\n\n• Máximo: *1000 ${currency}*\n• Interés: *20%*\n• Paga con: *${px}pagar*\n\n_¡Úsalo responsablemente~ 🌸_`
        )
        if (amount > 1000) return sendEco2(conn, m, `❌ El máximo de préstamo es *1000 ${currency}*~ 🌸`)
        const interes = Math.floor(amount * 0.2)
        u.money   += amount
        u.prestamo = amount + interes
        return sendEco2(conn, m,
            `💳 *¡PRÉSTAMO APROBADO!*\n\n` +
            `💰 Recibiste: *${formatN(amount)} ${currency}*\n` +
            `💸 A pagar: *${formatN(u.prestamo)} ${currency}* (20% interés)\n\n` +
            `_Usa *${px}pagar* cuando tengas el dinero~ 🌸_`
        )
    }

    // ── PAGAR PRÉSTAMO ────────────────────────────────────────────────────────
    if (cmd === 'pagar') {
        if (!(u.prestamo||0)) return sendEco2(conn, m, `✅ No tienes préstamos pendientes~ 🌸`)
        if ((u.money||0) < u.prestamo) return sendEco2(conn, m,
            `❌ No tienes suficiente.\n💳 Deuda: *${formatN(u.prestamo)} ${currency}*\n💰 Tienes: *${formatN(u.money)} ${currency}*`
        )
        u.money   -= u.prestamo
        u.prestamo = 0
        return sendEco2(conn, m,
            `✅ *¡PRÉSTAMO PAGADO!*\n\n` +
            `💳 Deuda liquidada completamente~ 🌸\n` +
            `💰 Balance: *${formatN(u.money)} ${currency}*\n\n` +
            `_¡Itsuki está orgullosa de tu responsabilidad!_ 🌸`
        )
    }

    // ── INVERTIR ──────────────────────────────────────────────────────────────
    if (cmd === 'invertir' || cmd === 'invest') {
        if (onCD('ultimoInvert', CD1M, 'invertir')) return
        const amount = parseInt(args[0]) || 0
        if (!amount || amount < 10) return sendEco2(conn, m,
            `📈 *INVERSIÓN*\n\nUso: *${px}invertir <cantidad>*\n_Mínimo: 10 ${currency}_ 🌸`
        )
        if ((u.money||0) < amount) return sendEco2(conn, m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatN(u.money)} ${currency}*`
        )
        u.money -= amount
        u.ultimoInvert = now
        const resultado = Math.random()
        let ganancia, msg
        if (resultado < 0.10) { // Jackpot 10%
            ganancia = amount * 5; u.money += ganancia
            msg = `💎 *¡INVERSIÓN ÉPICA!* ×5\n\nInvertiste *${formatN(amount)}* y ganaste *${formatN(ganancia)} ${currency}*! 🎉`
        } else if (resultado < 0.40) { // Buena 30%
            ganancia = Math.floor(amount * (1.5 + Math.random())); u.money += ganancia
            msg = `📈 *¡BUENA INVERSIÓN!*\n\nInvertiste *${formatN(amount)}* y ganaste *${formatN(ganancia)} ${currency}*~ 🌸`
        } else if (resultado < 0.60) { // Recuperas 20%
            ganancia = amount; u.money += ganancia
            msg = `😐 *INVERSIÓN NEUTRAL*\n\nRecuperaste tu inversión de *${formatN(amount)} ${currency}*~ 🌸`
        } else { // Pérdida 40%
            const perdida = Math.floor(amount * (0.3 + Math.random() * 0.5))
            ganancia = amount - perdida; if(ganancia>0) u.money += ganancia
            msg = `📉 *¡INVERSIÓN FALLIDA!*\n\nPerdiste *${formatN(amount - Math.max(0,ganancia))} ${currency}* 💸\n_El mercado es impredecible~ 🌸_`
        }
        return sendEco2(conn, m, msg + `\n\n💰 Balance: *${formatN(u.money)} ${currency}*`)
    }

    // ── LOTERÍA ───────────────────────────────────────────────────────────────
    if (cmd === 'loteria' || cmd === 'lottery') {
        if (onCD('ultimoLoteria', CD24H, 'lotería')) return
        const ticket = parseInt(args[0]) || 50
        if ((u.money||0) < ticket) return sendEco2(conn, m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatN(u.money)} ${currency}*`
        )
        u.money -= ticket; u.ultimoLoteria = now
        const nums   = Array.from({length:6}, () => randInt(1,49)).sort((a,b)=>a-b)
        const premio = Math.random()
        let resultado = '', ganancia = 0
        if (premio < 0.01) { ganancia = ticket * 100; resultado = `🎰 *¡¡JACKPOT MÁXIMO!! ×100*` }
        else if (premio < 0.05) { ganancia = ticket * 20; resultado = `🏆 *¡PRIMER PREMIO! ×20*` }
        else if (premio < 0.15) { ganancia = ticket * 5; resultado = `🥈 *¡SEGUNDO PREMIO! ×5*` }
        else if (premio < 0.35) { ganancia = ticket * 2; resultado = `🥉 *¡TERCER PREMIO! ×2*` }
        else { resultado = `😢 *Sin suerte esta vez*`; ganancia = 0 }
        u.money += ganancia
        return sendEco2(conn, m,
            `🎰 *LOTERÍA ITSUKI*\n\n` +
            `🎫 Ticket: *${formatN(ticket)} ${currency}*\n` +
            `🔢 Números: *${nums.join(' - ')}*\n\n` +
            `${resultado}\n` +
            `${ganancia > 0 ? `💰 Ganaste: *${formatN(ganancia)} ${currency}*` : `💸 Perdiste el ticket`}\n\n` +
            `💰 Balance: *${formatN(u.money)} ${currency}*\n\n` +
            `_¡Vuelve mañana para otro ticket~ 🌸_`
        )
    }

    // ── MERCADO DE ACCIONES ───────────────────────────────────────────────────
    if (cmd === 'mercado' || cmd === 'market') {
        const precios = ACCIONES.map(a => ({ ...a, precio: getPrecio(a) }))
        return sendEco2(conn, m,
            `📊 *MERCADO DE ACCIONES*\n\n` +
            precios.map(a => `${a.nombre}\n   💰 Precio: *${a.precio} ${currency}*\n   📈 ID: \`${a.id}\``).join('\n\n') + '\n\n' +
            `_Usa *${px}comprar <id> <cantidad>* para invertir~ 🌸_`
        )
    }

    if (cmd === 'compraraccion' || cmd === 'buystock') {
        if (onCD('ultimoMercado', CD1M, 'acciones')) return
        const id   = args[0]?.toLowerCase()
        const cant = parseInt(args[1]) || 1
        const acc  = ACCIONES.find(a => a.id === id)
        if (!acc) return sendEco2(conn, m, `❌ Acción no encontrada. Usa *${px}mercado* para ver las disponibles~`)
        const precio = getPrecio(acc)
        const total  = precio * cant
        if ((u.money||0) < total) return sendEco2(conn, m,
            `❌ No tienes suficiente\n💰 Necesitas: *${formatN(total)}*\n💰 Tienes: *${formatN(u.money)}*`
        )
        u.money -= total; u.ultimoMercado = now
        if (!u.acciones) u.acciones = {}
        u.acciones[id] = (u.acciones[id]||0) + cant
        return sendEco2(conn, m,
            `📈 *¡ACCIONES COMPRADAS!*\n\n` +
            `${acc.nombre}\n` +
            `📦 Cantidad: *${cant}*\n💰 Precio unitario: *${precio}*\n💸 Total pagado: *${formatN(total)} ${currency}*\n\n` +
            `_Úsalas con *${px}venderaccion ${id} ${cant}*~ 🌸_`
        )
    }

    if (cmd === 'venderaccion' || cmd === 'sellstock') {
        const id   = args[0]?.toLowerCase()
        const cant = parseInt(args[1]) || 1
        const acc  = ACCIONES.find(a => a.id === id)
        if (!acc) return sendEco2(conn, m, `❌ Acción no encontrada~`)
        if (!(u.acciones?.[id] >= cant)) return sendEco2(conn, m,
            `❌ No tienes suficientes acciones de *${acc.nombre}*\nTienes: *${u.acciones?.[id]||0}*`
        )
        const precio = getPrecio(acc)
        const total  = precio * cant
        u.acciones[id] -= cant
        u.money        += total
        const ganPerd  = Math.random() > 0.5 ? '📈 subió' : '📉 bajó'
        return sendEco2(conn, m,
            `📉 *¡ACCIONES VENDIDAS!*\n\n` +
            `${acc.nombre}\n📦 Cantidad: *${cant}*\n💰 Precio: *${precio}* (${ganPerd})\n✅ Recibiste: *${formatN(total)} ${currency}*\n\n💰 Balance: *${formatN(u.money)} ${currency}*`
        )
    }

    // ── MIS ACCIONES ──────────────────────────────────────────────────────────
    if (cmd === 'misacciones' || cmd === 'portfolio') {
        const acc = u.acciones || {}
        const keys = Object.keys(acc).filter(k => acc[k] > 0)
        if (!keys.length) return sendEco2(conn, m, `📊 No tienes acciones. Usa *${px}mercado*~ 🌸`)
        const lista = keys.map(k => {
            const a = ACCIONES.find(x => x.id === k)
            return `${a?.nombre||k}: *${acc[k]}* acciones`
        }).join('\n')
        return sendEco2(conn, m, `📊 *MIS ACCIONES*\n\n${lista}\n\n_Vende con *${px}venderaccion*~ 🌸_`)
    }

    // ── ROBAR EXP ─────────────────────────────────────────────────────────────
    if (cmd === 'robarexp') {
        if (onCD('ultimoRobExp', CD1M, 'robarexp')) return
        const normalizeJid = (jid) => jid.split('@')[0].split(':')[0]+'@s.whatsapp.net'
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        if (!target) return sendEco2(conn, m, `🎯 Menciona o responde a alguien~`)
        if (target === sender) return sendEco2(conn, m, `😂 No puedes robarte a ti mismo~`)
        ensureUser(db, target)
        const vic = db.users[target]
        if (!(vic.exp||0)) return sendEco2(conn, m, `😂 @${target.split('@')[0]} no tiene exp 💀`, [target])
        if (Math.random() < 0.4) {
            const multa = randInt(10,30); u.exp = Math.max(0,(u.exp||0)-multa)
            u.ultimoRobExp = now
            return sendEco2(conn, m, `🚔 ¡Te atraparon! Perdiste *${multa} Exp* 💀`, [target])
        }
        const amount = Math.floor((vic.exp||0) * (randInt(10,30)/100))
        vic.exp = Math.max(0,(vic.exp||0)-amount); u.exp = (u.exp||0)+amount; u.ultimoRobExp = now
        return sendEco2(conn, m,
            `🥷 *¡ROBO DE EXP!*\n\nRobaste *${formatN(amount)} Exp* a @${target.split('@')[0]} 💀\n✨ Tu Exp: *${formatN(u.exp)}*`,
            [target]
        )
    }
}

handler.command = ['prestamo','pagar','invertir','invest','loteria','lottery','mercado','market','compraraccion','buystock','venderaccion','sellstock','misacciones','portfolio','robarexp']
export default handler
