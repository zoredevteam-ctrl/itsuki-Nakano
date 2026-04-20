/**
 * JUEGOS - ITSUKI NAKANO
 * #trivia #adivina #pista #rendirse #rruleta
 * Z0RT SYSTEMS 🌸
 */

const sendJuego = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `🎮 ${global.botName||'Itsuki Nakano'}`, 'Juegos')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// ── TRIVIA ────────────────────────────────────────────────────────────────────
const PREGUNTAS = [
    { p:'¿Cuántos colores tiene el arcoíris?', r:'7', o:['5','6','7','8'] },
    { p:'¿Cuál es el planeta más grande del sistema solar?', r:'júpiter', o:['saturno','júpiter','neptuno','urano'] },
    { p:'¿En qué año llegó el hombre a la Luna?', r:'1969', o:['1965','1967','1969','1972'] },
    { p:'¿Cuál es el océano más grande del mundo?', r:'pacífico', o:['atlántico','índico','pacífico','ártico'] },
    { p:'¿Cuántos huesos tiene el cuerpo humano adulto?', r:'206', o:['150','206','256','300'] },
    { p:'¿Cuál es la capital de Japón?', r:'tokio', o:['osaka','kioto','tokio','nagoya'] },
    { p:'¿Qué elemento tiene el símbolo químico "Au"?', r:'oro', o:['plata','cobre','oro','hierro'] },
    { p:'¿Cuántos lados tiene un hexágono?', r:'6', o:['5','6','7','8'] },
    { p:'¿Quién pintó la Mona Lisa?', r:'leonardo da vinci', o:['miguel ángel','rafael','leonardo da vinci','botticelli'] },
    { p:'¿Cuál es el animal terrestre más rápido?', r:'guepardo', o:['león','guepardo','leopardo','tigre'] },
    { p:'¿Cuántos metros tiene 1 kilómetro?', r:'1000', o:['100','500','1000','10000'] },
    { p:'¿Cuál es el país más grande del mundo?', r:'rusia', o:['china','canada','rusia','estados unidos'] },
    { p:'¿En qué continente está Brasil?', r:'sudamérica', o:['norteamérica','europa','sudamérica','africa'] },
    { p:'¿Cuántas cuerdas tiene una guitarra estándar?', r:'6', o:['4','5','6','7'] },
    { p:'¿Qué gas respiramos principalmente?', r:'nitrógeno', o:['oxígeno','nitrógeno','co2','hidrógeno'] }
]

const triviaActiva = new Map()

// ── ADIVINA EL NÚMERO ─────────────────────────────────────────────────────────
const adivinaActiva = new Map()

// ── RULETA ────────────────────────────────────────────────────────────────────
const RULETA_ITEMS = [
    { emoji:'💀', texto:'¡PERDISTE TODO! La ruleta te arruinó', mult: 0 },
    { emoji:'😢', texto:'Mala suerte, perdiste la mitad', mult: 0.5 },
    { emoji:'😐', texto:'Sin cambios, recuperaste lo apostado', mult: 1 },
    { emoji:'🌸', texto:'¡Ganaste el doble!', mult: 2 },
    { emoji:'⭐', texto:'¡Increíble! Ganaste x3', mult: 3 },
    { emoji:'💎', texto:'¡JACKPOT! Ganaste x5', mult: 5 }
]

let handler = async (m, { conn, command, text, args, db }) => {
    const cmd    = command.toLowerCase()
    const chatId = m.chat
    const sender = (m.sender||'').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/,'').split('@')[0]+'@s.whatsapp.net'
    const prefix = global.prefix || '#'

    // ── TRIVIA ────────────────────────────────────────────────────────────────
    if (cmd === 'trivia') {
        if (triviaActiva.has(chatId)) return sendJuego(conn, m,
            `❓ Ya hay una trivia activa en este chat.\n_¡Responde la pregunta actual!_ 🌸`
        )
        const q = PREGUNTAS[randInt(0, PREGUNTAS.length - 1)]
        const opciones = [...q.o].sort(() => Math.random() - 0.5)

        triviaActiva.set(chatId, {
            respuesta: q.r.toLowerCase(),
            opciones,
            timer: setTimeout(() => {
                triviaActiva.delete(chatId)
                conn.sendMessage(chatId, { text: `⏰ *¡Tiempo agotado!*\nLa respuesta era: *${q.r}* 🌸` })
            }, 30000)
        })

        return sendJuego(conn, m,
            `❓ *TRIVIA ITSUKI*\n\n` +
            `*${q.p}*\n\n` +
            opciones.map((o, i) => `${['🅰️','🅱️','🆑','🆔'][i]} ${o}`).join('\n') + '\n\n' +
            `_Tienes 30 segundos para responder~ 🌸_`
        )
    }

    // ── ADIVINA ───────────────────────────────────────────────────────────────
    if (cmd === 'adivina') {
        if (adivinaActiva.has(chatId)) return sendJuego(conn, m,
            `🔢 Ya hay un juego activo.\n_Usa *${prefix}pista* para una pista_ 🌸`
        )
        const numero = randInt(1, 100)
        adivinaActiva.set(chatId, {
            numero, intentos: 0,
            timer: setTimeout(() => {
                adivinaActiva.delete(chatId)
                conn.sendMessage(chatId, { text: `⏰ *¡Tiempo agotado!*\nEl número era: *${numero}* 🌸` })
            }, 60000)
        })
        return sendJuego(conn, m,
            `🔢 *ADIVINA EL NÚMERO*\n\n` +
            `Pensé un número del *1 al 100*~\n` +
            `¿Puedes adivinarlo? 🌸\n\n` +
            `_Escribe un número para intentarlo_\n` +
            `_Usa *${prefix}pista* para una pista_\n` +
            `_Usa *${prefix}rendirse* para rendirte_`
        )
    }

    // ── PISTA ─────────────────────────────────────────────────────────────────
    if (cmd === 'pista') {
        const juego = adivinaActiva.get(chatId)
        if (!juego) return sendJuego(conn, m, `❌ No hay ningún juego activo. Usa *${prefix}adivina*`)
        const n = juego.numero
        const pista = n <= 25 ? 'entre 1 y 25' : n <= 50 ? 'entre 26 y 50' : n <= 75 ? 'entre 51 y 75' : 'entre 76 y 100'
        return sendJuego(conn, m, `💡 *PISTA:*\nEl número está *${pista}* 🌸`)
    }

    // ── RENDIRSE ──────────────────────────────────────────────────────────────
    if (cmd === 'rendirse') {
        const juego = adivinaActiva.get(chatId)
        if (!juego) return sendJuego(conn, m, `❌ No hay ningún juego activo.`)
        clearTimeout(juego.timer)
        adivinaActiva.delete(chatId)
        return sendJuego(conn, m, `🏳️ Te rendiste.\nEl número era *${juego.numero}* 🌸\n_¡La próxima vez lo logras!_`)
    }

    // ── RULETA ────────────────────────────────────════════════════════════════
    if (cmd === 'rruleta' || cmd === 'ruleta2') {
        if (!db.users) db.users = {}
        if (!db.users[sender]) db.users[sender] = { money: 0 }
        const u = db.users[sender]

        const apuesta = parseInt(args[0]) || 50
        if (apuesta <= 0) return sendJuego(conn, m, '❌ La apuesta debe ser mayor a 0')
        if ((u.money || 0) < apuesta) return sendJuego(conn, m,
            `❌ No tienes suficiente\n💰 Tienes: *${u.money || 0} Flores*`
        )

        // Animación
        await sendJuego(conn, m, `🎡 *Girando la ruleta...*\n\n🔴 🔵 🟡 🟢 🟠 🟣\n\n_Esperando resultado~_ 🌸`)

        await new Promise(r => setTimeout(r, 2000))

        const idx = randInt(0, RULETA_ITEMS.length - 1)
        const resultado = RULETA_ITEMS[idx]
        const ganancia  = Math.floor(apuesta * resultado.mult)

        u.money = Math.max(0, (u.money || 0) - apuesta + ganancia)

        return sendJuego(conn, m,
            `🎡 *RULETA ITSUKI*\n\n` +
            `${resultado.emoji} *${resultado.texto}*\n\n` +
            `💸 Apostaste: *${apuesta} Flores*\n` +
            `${resultado.mult >= 1 ? '✅' : '❌'} ${resultado.mult === 0 ? `Perdiste: *${apuesta} Flores*` : resultado.mult < 1 ? `Recuperaste: *${ganancia} Flores*` : `Ganaste: *${ganancia} Flores*`}\n\n` +
            `💰 Balance: *${u.money} Flores*`
        )
    }
}

// ── BEFORE — procesar respuestas de trivia y adivina ─────────────────────────
handler.before = async (m, { conn }) => {
    if (!m.body || m.body.startsWith(global.prefix || '#')) return false
    const chatId = m.chat
    const body   = m.body.trim().toLowerCase()

    // Trivia
    const trivia = triviaActiva.get(chatId)
    if (trivia) {
        const correcta = trivia.respuesta
        if (body === correcta || trivia.opciones.some(o => o.toLowerCase() === body && o.toLowerCase() === correcta)) {
            clearTimeout(trivia.timer)
            triviaActiva.delete(chatId)
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🎮 ${global.botName||'Itsuki Nakano'}`, 'Trivia')
            await conn.sendMessage(chatId, {
                text: `✅ *¡CORRECTO!*\n\n@${m.sender.split('@')[0]} acertó la respuesta: *${correcta}* 🎉\n\n_¡Bien hecho!~ 🌸_`,
                mentions: [m.sender], contextInfo: ctx
            }, { quoted: m })
            return true
        }
    }

    // Adivina
    const juego = adivinaActiva.get(chatId)
    if (juego && /^\d+$/.test(body)) {
        const num    = parseInt(body)
        juego.intentos++
        if (num === juego.numero) {
            clearTimeout(juego.timer)
            adivinaActiva.delete(chatId)
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🎮 ${global.botName||'Itsuki Nakano'}`, 'Adivina')
            await conn.sendMessage(chatId, {
                text: `🎉 *¡CORRECTO!*\n\n@${m.sender.split('@')[0]} adivinó el número *${juego.numero}* en *${juego.intentos}* intentos! 🌸`,
                mentions: [m.sender], contextInfo: ctx
            }, { quoted: m })
            return true
        } else {
            const hint = num < juego.numero ? '📈 Es *mayor*' : '📉 Es *menor*'
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🎮 ${global.botName||'Itsuki Nakano'}`, 'Adivina')
            await conn.sendMessage(chatId, {
                text: `❌ No es *${num}*. ${hint}~\n_Intento #${juego.intentos}_ 🌸`,
                contextInfo: ctx
            }, { quoted: m })
            return false
        }
    }
    return false
}

handler.command = ['trivia','adivina','pista','rendirse','rruleta','ruleta2']
export default handler
