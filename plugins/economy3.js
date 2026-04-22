/**
 * ECONOMÍA EXTRA - ITSUKI NAKANO
 * #weekly #monthly #aventura #cazar #coinflip #roulette #einfo #givecoins
 * Z0RT SYSTEMS 🌸
 */

const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const formatN  = (n) => { try { const v=parseInt(n)||0; if(v>=1_000_000)return(v/1_000_000).toFixed(1)+'M'; if(v>=1_000)return(v/1_000).toFixed(1)+'k'; return v.toLocaleString() } catch { return String(n||0) } }
const toMs     = (d=0,h=0,m=0) => ((d*86400)+(h*3600)+(m*60))*1000
const CD_WEEK  = toMs(7,0,0)
const CD_MONTH = toMs(30,0,0)
const CD_1M    = toMs(0,1,0)

const sendEco = async (conn, m, text, mentions=[]) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `💰 ${global.botName||'Itsuki Nakano'}`, 'Economía Extra')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const normalizeJid = (jid) => jid?.split('@')[0]?.split(':')[0] + '@s.whatsapp.net'

const ensureUser = (db, jid) => {
    if (!db.users) db.users = {}
    if (!db.users[jid]) db.users[jid] = {}
    const d = { money:0, bank:0, exp:0, level:1, wins:0, hp:100, maxHp:100,
                lastWeekly:0, lastMonthly:0, lastAventura:0, lastCazar:0,
                lastCoinflip:0, lastRoulette:0 }
    for(const[k,v]of Object.entries(d)) if(db.users[jid][k]===undefined) db.users[jid][k]=v
    return db.users[jid]
}

const AVENTURAS = [
    { lugar:'🌲 Bosque Oscuro',     min:80,  max:250, exp:30, riesgo:0.2 },
    { lugar:'⛰️ Montaña Nevada',    min:150, max:400, exp:50, riesgo:0.3 },
    { lugar:'🏜️ Desierto Ardiente', min:50,  max:200, exp:20, riesgo:0.1 },
    { lugar:'🌊 Cueva Submarina',   min:200, max:600, exp:80, riesgo:0.4 },
    { lugar:'🏰 Castillo Maldito',  min:300, max:800, exp:100,riesgo:0.5 },
    { lugar:'🌋 Volcán Activo',     min:400, max:1000,exp:120,riesgo:0.6 }
]

const ANIMALES = [
    { nombre:'🐺 Lobo',      min:50,  max:120, exp:15 },
    { nombre:'🦊 Zorro',     min:30,  max:80,  exp:10 },
    { nombre:'🐗 Jabalí',    min:60,  max:150, exp:20 },
    { nombre:'🦌 Ciervo',    min:80,  max:200, exp:25 },
    { nombre:'🐻 Oso',       min:120, max:300, exp:40 },
    { nombre:'🦁 León',      min:200, max:500, exp:60 },
    { nombre:'🐉 Dragón',    min:400, max:1000,exp:100 }
]

let handler = async (m, { conn, command, text, args, isOwner, db }) => {
    const cmd    = command.toLowerCase()
    const sender = normalizeJid(m.sender)
    const u      = ensureUser(db, sender)
    const name   = m.pushName || sender.split('@')[0]
    const now    = Date.now()
    const px     = global.prefix || '#'
    const currency = 'Flores'

    const onCD = (key, tiempo, nombre) => {
        const diff = now-(u[key]||0)
        if(diff<tiempo){
            const rem = tiempo-diff
            const h=Math.floor(rem/3600000), m2=Math.floor((rem%3600000)/60000)
            sendEco(conn,m,`⏳ *${nombre}* disponible en *${h>0?h+'h ':''} ${m2}m*~ 🌸`)
            return true
        }
        return false
    }

    // ── WEEKLY ────────────────────────────────────────────────────────────────
    if (cmd === 'weekly' || cmd === 'semanal') {
        if (onCD('lastWeekly', CD_WEEK, 'Recompensa Semanal')) return
        const amount = randInt(800, 2000)
        const exp    = randInt(100, 300)
        u.money += amount; u.exp += exp; u.lastWeekly = now
        return sendEco(conn, m,
            `📅 *¡RECOMPENSA SEMANAL!*\n\n` +
            `💰 *+${amount} ${currency}*\n✨ *+${exp} Exp*\n\n` +
            `_¡Que tengas una linda semana~ 🌸_`
        )
    }

    // ── MONTHLY ───────────────────────────────────────────────────────────────
    if (cmd === 'monthly' || cmd === 'mensual') {
        if (onCD('lastMonthly', CD_MONTH, 'Recompensa Mensual')) return
        const amount = randInt(3000, 8000)
        const exp    = randInt(500, 1000)
        u.money += amount; u.exp += exp; u.lastMonthly = now
        return sendEco(conn, m,
            `🗓️ *¡RECOMPENSA MENSUAL!*\n\n` +
            `💰 *+${amount} ${currency}*\n✨ *+${exp} Exp*\n\n` +
            `_¡Un mes más juntos~ 🌸_`
        )
    }

    // ── AVENTURA ──────────────────────────────────────────────────────────────
    if (cmd === 'aventura' || cmd === 'adventure') {
        if (onCD('lastAventura', CD_1M, 'Aventura')) return
        if ((u.hp||0) <= 0) return sendEco(conn, m,
            `❤️ Estás sin HP. Usa *${px}curar* primero~ 🌸`
        )
        u.lastAventura = now
        const av = AVENTURAS[randInt(0, AVENTURAS.length-1)]
        if (Math.random() < av.riesgo) {
            const daño = randInt(10, 30)
            u.hp = Math.max(0, (u.hp||0) - daño)
            return sendEco(conn, m,
                `💥 *AVENTURA — ${av.lugar}*\n\n` +
                `Algo salió mal en tu aventura...\n` +
                `❤️ Perdiste *${daño} HP* | HP restante: *${u.hp}/${u.maxHp||100}*\n\n` +
                `_Si te quedas sin HP no podrás aventurar~ 🌸_`
            )
        }
        const ganancia = randInt(av.min, av.max)
        const exp      = randInt(av.exp, av.exp * 2)
        u.money += ganancia; u.exp += exp
        return sendEco(conn, m,
            `⚔️ *AVENTURA EXITOSA — ${av.lugar}*\n\n` +
            `Regresaste victorioso/a~ 🌸\n\n` +
            `💰 *+${ganancia} ${currency}*\n✨ *+${exp} Exp*\n\n` +
            `_¡Eres increíble~ 🌸_`
        )
    }

    // ── CAZAR ─────────────────────────────────────────────────────────────────
    if (cmd === 'cazar' || cmd === 'hunt') {
        if (onCD('lastCazar', CD_1M, 'Caza')) return
        if ((u.hp||0) <= 20) return sendEco(conn, m, `❤️ Necesitas al menos 20 HP para cazar. Usa *${px}curar*~ 🌸`)
        u.lastCazar = now
        const animal = ANIMALES[randInt(0, ANIMALES.length-1)]
        if (Math.random() < 0.25) {
            const daño = randInt(5, 20)
            u.hp = Math.max(0, (u.hp||0) - daño)
            return sendEco(conn, m,
                `🏹 *¡EL ANIMAL ESCAPÓ!*\n\n` +
                `${animal.nombre} te lastimó al huir.\n` +
                `❤️ Perdiste *${daño} HP*\n\n` +
                `_¡Mejor suerte la próxima~ 🌸_`
            )
        }
        const ganancia = randInt(animal.min, animal.max)
        const exp      = randInt(animal.exp, animal.exp * 2)
        u.money += ganancia; u.exp += exp
        return sendEco(conn, m,
            `🏹 *¡CAZA EXITOSA!*\n\n` +
            `Cazaste un *${animal.nombre}*~ 🌸\n\n` +
            `💰 *+${ganancia} ${currency}*\n✨ *+${exp} Exp*\n\n` +
            `_¡Buen tiro!_ 🌸`
        )
    }

    // ── CURAR (HP) ────────────────────────────────────────────────────────────
    if (cmd === 'curar' || cmd === 'heal') {
        if ((u.hp||0) >= (u.maxHp||100)) return sendEco(conn, m, `✅ Ya tienes HP completo~ 🌸`)
        const costo = 50
        if ((u.money||0) < costo) return sendEco(conn, m, `❌ Necesitas *${costo} ${currency}* para curarte~`)
        u.money -= costo; u.hp = u.maxHp || 100
        return sendEco(conn, m,
            `💊 *¡CURADO!*\n\n❤️ HP restaurado: *${u.hp}/${u.maxHp||100}*\n💰 Costo: *${costo} ${currency}*~ 🌸`
        )
    }

    // ── COINFLIP ──────────────────────────────────────────────────────────────
    if (cmd === 'coinflip' || cmd === 'flip' || cmd === 'cf') {
        if (onCD('lastCoinflip', CD_1M, 'Coinflip')) return
        const eleccion = args[1]?.toLowerCase() || args[0]?.toLowerCase()
        const apuesta  = parseInt(args[0]) || parseInt(args[1]) || 0
        if (!apuesta || !['cara','cruz'].includes(eleccion)) return sendEco(conn, m,
            `🪙 Uso: *${px}coinflip <cantidad> <cara/cruz>*\n_Ejemplo: ${px}cf 100 cara_ 🌸`
        )
        if ((u.money||0) < apuesta) return sendEco(conn, m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatN(u.money)} ${currency}*`
        )
        u.lastCoinflip = now
        const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
        const emoji     = resultado === 'cara' ? '🪙' : '💿'
        if (resultado === eleccion) {
            u.money += apuesta
            return sendEco(conn, m,
                `${emoji} *¡${resultado.toUpperCase()}!*\n\n` +
                `🎉 *¡GANASTE!* Elegiste *${eleccion}*\n` +
                `💰 *+${formatN(apuesta)} ${currency}*\n\n` +
                `💰 Balance: *${formatN(u.money)} ${currency}*`
            )
        } else {
            u.money -= apuesta
            return sendEco(conn, m,
                `${emoji} *¡${resultado.toUpperCase()}!*\n\n` +
                `💔 *¡PERDISTE!* Elegiste *${eleccion}*\n` +
                `💸 *-${formatN(apuesta)} ${currency}*\n\n` +
                `💰 Balance: *${formatN(u.money)} ${currency}*`
            )
        }
    }

    // ── ROULETTE (ruleta rojo/negro) ──────────────────────────────────────────
    if (cmd === 'roulette' || cmd === 'rt') {
        if (onCD('lastRoulette', CD_1M, 'Ruleta')) return
        const color   = args[0]?.toLowerCase()
        const apuesta = parseInt(args[1]) || 0
        if (!apuesta || !['red','black','rojo','negro'].includes(color)) return sendEco(conn, m,
            `🎡 Uso: *${px}roulette <rojo/negro> <cantidad>*\n_Ejemplo: ${px}rt rojo 100_ 🌸`
        )
        if ((u.money||0) < apuesta) return sendEco(conn, m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatN(u.money)} ${currency}*`
        )
        u.lastRoulette = now
        const numero   = randInt(0, 36)
        const esRojo   = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(numero)
        const esNegro  = numero !== 0 && !esRojo
        const eligioRojo = color==='rojo'||color==='red'
        const gano     = numero===0 ? false : eligioRojo ? esRojo : esNegro
        const emoji    = numero===0 ? '🟢' : esRojo ? '🔴' : '⚫'
        if (gano) {
            u.money += apuesta
            return sendEco(conn, m,
                `🎡 *RULETA — ${emoji} ${numero}*\n\n` +
                `🎉 *¡GANASTE!* Apostaste a *${color}*\n` +
                `💰 *+${formatN(apuesta)} ${currency}*\n\n` +
                `💰 Balance: *${formatN(u.money)} ${currency}*`
            )
        } else {
            u.money -= apuesta
            return sendEco(conn, m,
                `🎡 *RULETA — ${emoji} ${numero}*\n\n` +
                `${numero===0?'🟢 El cero gana siempre':'💔 *¡PERDISTE!*'} Apostaste a *${color}*\n` +
                `💸 *-${formatN(apuesta)} ${currency}*\n\n` +
                `💰 Balance: *${formatN(u.money)} ${currency}*`
            )
        }
    }

    // ── EINFO ─────────────────────────────────────────────────────────────────
    if (cmd === 'economyinfo' || cmd === 'einfo') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : sender
        ensureUser(db, target)
        const user = db.users[target]
        return sendEco(conn, m,
            `📊 *ECONOMÍA — @${target.split('@')[0]}*\n\n` +
            `💰 Efectivo: *${formatN(user.money||0)} ${currency}*\n` +
            `🏦 Banco: *${formatN(user.bank||0)} ${currency}*\n` +
            `📊 Total: *${formatN((user.money||0)+(user.bank||0))} ${currency}*\n` +
            `✨ Exp: *${formatN(user.exp||0)}*\n` +
            `⭐ Nivel: *${user.level||1}*\n` +
            `❤️ HP: *${user.hp||100}/${user.maxHp||100}*\n` +
            `💳 Deuda: *${formatN(user.prestamo||0)} ${currency}*\n\n` +
            `_Estadísticas económicas~ 🌸_`,
            [target]
        )
    }

    // ── GIVECOINS ─────────────────────────────────────────────────────────────
    if (cmd === 'givecoins' || cmd === 'pay' || cmd === 'coinsgive') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        const amount = parseInt((text||'').replace(/@\d+/g,'').trim()) || 0
        if (!target || !amount) return sendEco(conn, m,
            `💸 Uso: *${px}pay @usuario <cantidad>*\n_Ejemplo: ${px}pay @amigo 500_ 🌸`
        )
        if (target === sender) return sendEco(conn, m, `😂 No puedes pagarte a ti mismo~`)
        if ((u.money||0) < amount) return sendEco(conn, m,
            `❌ No tienes suficiente\n💰 Tienes: *${formatN(u.money)} ${currency}*`
        )
        u.money -= amount
        ensureUser(db, target).money += amount
        return sendEco(conn, m,
            `💸 *¡PAGO REALIZADO!*\n\n` +
            `💰 Enviaste *${formatN(amount)} ${currency}* a @${target.split('@')[0]}~ 🌸`,
            [target]
        )
    }
}

handler.command = ['weekly','semanal','monthly','mensual','aventura','adventure','cazar','hunt','curar','heal','coinflip','flip','cf','roulette','rt','economyinfo','einfo','givecoins','pay','coinsgive']
export default handler
