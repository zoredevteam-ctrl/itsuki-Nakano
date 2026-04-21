/**
 * MÁS JUEGOS - ITSUKI NAKANO
 * #ahorcado #ppt #blackjack #dados #moneda #memoria #acertijo
 * Z0RT SYSTEMS 🌸
 */

const sendGame = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `🎮 ${global.botName||'Itsuki Nakano'}`, 'Juegos')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// ── AHORCADO ──────────────────────────────────────────────────────────────────
const PALABRAS = ['sakura','katana','ramen','sushi','anime','manga','ninja','samurai','geisha','kabuki','futon','kimono','origami','bonsai','haiku','tempura','sashimi','teriyaki','wasabi','mochi','matcha','karate','judo','sumo','torii','pagoda','shogun','daimyo','bushido','ikebana','manga','cosplay','otaku','kawaii','senpai','sensei','kohai','nakama','yoroshiku','konnichiwa']

const ahorcadoActivo = new Map()

const dibujarAhorcado = (intentos) => {
    const partes = [
        '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
        '  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========',
        '  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========',
        '  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========',
        '  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========',
        '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========',
        '  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========='
    ]
    return '```\n' + partes[Math.min(intentos, 6)] + '\n```'
}

// ── BLACKJACK ─────────────────────────────────────────────────────────────────
const blackjackActivo = new Map()

const crearBaraja = () => {
    const palos   = ['♠','♥','♦','♣']
    const valores = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
    const baraja  = []
    for (const p of palos) for (const v of valores) baraja.push({ palo:p, valor:v })
    return baraja.sort(() => Math.random() - 0.5)
}

const valorCarta = (carta) => {
    if (['J','Q','K'].includes(carta.valor)) return 10
    if (carta.valor === 'A') return 11
    return parseInt(carta.valor)
}

const valorMano = (mano) => {
    let total = mano.reduce((s, c) => s + valorCarta(c), 0)
    let ases  = mano.filter(c => c.valor === 'A').length
    while (total > 21 && ases > 0) { total -= 10; ases-- }
    return total
}

const mostrarMano = (mano) => mano.map(c => `${c.valor}${c.palo}`).join(' ')

// ── ACERTIJOS ─────────────────────────────────────────────────────────────────
const ACERTIJOS = [
    { p:'¿Qué tiene dientes pero no puede morder?', r:'un peine' },
    { p:'¿Qué cosa se rompe sin tocarla?', r:'el silencio' },
    { p:'¿Qué tiene el sol de día y la luna de noche?', r:'la letra o' },
    { p:'¿Qué va de punta a punta y lleva la gente en la boca?', r:'la lengua' },
    { p:'¿Cuanto más grande, menos pesa. ¿Qué es?', r:'un agujero' },
    { p:'¿Qué entra por los oídos y sale por los ojos?', r:'el sueño' },
    { p:'¿Qué tiene manos pero no puede aplaudir?', r:'un reloj' },
    { p:'¿Qué corre pero no tiene pies?', r:'el agua' },
    { p:'Tiene cabeza, tiene cola, pero no tiene cuerpo. ¿Qué es?', r:'una moneda' },
    { p:'¿Qué sube cuando llueve y baja cuando hace sol?', r:'un paraguas' }
]
const acertijoActivo = new Map()

let handler = async (m, { conn, command, text, args, db }) => {
    const cmd    = command.toLowerCase()
    const sender = (m.sender||'').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/,'').split('@')[0]+'@s.whatsapp.net'
    const query  = (text||'').trim().toLowerCase()
    const px     = global.prefix || '#'

    // ── AHORCADO ──────────────────────────────────────────────────────────────
    if (cmd === 'ahorcado') {
        if (ahorcadoActivo.has(m.chat)) return sendGame(conn, m,
            `🎮 Ya hay un ahorcado activo.\n_Escribe una letra para adivinar~ 🌸_`
        )
        const palabra   = PALABRAS[randInt(0, PALABRAS.length - 1)]
        const adivinado = new Set()
        ahorcadoActivo.set(m.chat, { palabra, adivinado, intentos:0, iniciador:sender })
        const mostrar   = palabra.split('').map(l => '_').join(' ')
        return sendGame(conn, m,
            `🎮 *AHORCADO ITSUKI*\n\n` +
            dibujarAhorcado(0) + '\n\n' +
            `📝 Palabra: \`${mostrar}\`\n` +
            `💡 ${palabra.length} letras\n\n` +
            `_Escribe una letra para empezar~ 🌸_\n` +
            `_Usa *${px}rendirahor* para rendirte_`
        )
    }

    if (cmd === 'rendirahor') {
        const juego = ahorcadoActivo.get(m.chat)
        if (!juego) return sendGame(conn, m, `❌ No hay ahorcado activo~`)
        ahorcadoActivo.delete(m.chat)
        return sendGame(conn, m, `🏳️ Juego terminado.\nLa palabra era: *${juego.palabra}* 🌸`)
    }

    // ── PPT (Piedra Papel Tijera) ──────────────────────────────────────────────
    if (cmd === 'ppt' || cmd === 'rps') {
        const opciones = ['piedra','papel','tijera']
        const eleccion = query
        if (!opciones.includes(eleccion)) return sendGame(conn, m,
            `✊ *PIEDRA PAPEL TIJERA*\n\nUso: *${px}ppt <piedra/papel/tijera>*\n_Ejemplo: ${px}ppt piedra_ 🌸`
        )
        const bote = opciones[randInt(0, 2)]
        const emojis = { piedra:'✊', papel:'✋', tijera:'✌️' }
        let resultado = ''
        if (eleccion === bote) resultado = '🤝 *¡EMPATE!*'
        else if ((eleccion==='piedra'&&bote==='tijera')||(eleccion==='papel'&&bote==='piedra')||(eleccion==='tijera'&&bote==='papel')) resultado = '🏆 *¡GANASTE!*'
        else resultado = '💔 *¡PERDISTE!*'
        return sendGame(conn, m,
            `${emojis[eleccion]} vs ${emojis[bote]}\n\n` +
            `Tú: *${eleccion}* ${emojis[eleccion]}\n` +
            `Itsuki: *${bote}* ${emojis[bote]}\n\n` +
            `${resultado}\n\n_¡Juega de nuevo~ 🌸_`
        )
    }

    // ── DADOS ─────────────────────────────────────────────────────────────────
    if (cmd === 'dados' || cmd === 'dice') {
        const cant = Math.min(parseInt(args[0]) || 1, 5)
        const resultados = Array.from({length:cant}, () => randInt(1,6))
        const emojis = ['','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣']
        const suma = resultados.reduce((a,b) => a+b, 0)
        return sendGame(conn, m,
            `🎲 *DADOS ITSUKI*\n\n` +
            `${resultados.map(r => emojis[r]).join(' ')}\n\n` +
            `${cant > 1 ? `➕ Suma total: *${suma}*\n` : ''}` +
            `${resultados.map(r => `🎲 ${r}`).join(' | ')}\n\n` +
            `_¡La suerte habló~ 🌸_`
        )
    }

    // ── MONEDA ────────────────────────────────────────────────────────────────
    if (cmd === 'moneda' || cmd === 'coin' || cmd === 'flipcoin') {
        const resultado = Math.random() < 0.5 ? 'CARA 🪙' : 'SELLO 💿'
        return sendGame(conn, m,
            `🪙 *LANZANDO MONEDA...*\n\n` +
            `¡El resultado es: *${resultado}*!\n\n` +
            `_¡La fortuna decidió~ 🌸_`
        )
    }

    // ── BLACKJACK ─────────────────────────────────────────────────────────────
    if (cmd === 'blackjack' || cmd === 'bj') {
        if (blackjackActivo.has(sender)) {
            const juego = blackjackActivo.get(sender)
            return sendGame(conn, m,
                `🃏 Ya tienes una partida activa.\n` +
                `Tu mano: ${mostrarMano(juego.jugador)} (${valorMano(juego.jugador)})\n\n` +
                `_Usa *${px}pedir* o *${px}plantarse*~ 🌸_`
            )
        }
        const apuesta = parseInt(args[0]) || 50
        if (!db.users) db.users = {}
        if (!db.users[sender]) db.users[sender] = { money:0 }
        if ((db.users[sender].money||0) < apuesta) return sendGame(conn, m,
            `❌ No tienes suficiente\n💰 Tienes: *${db.users[sender].money||0} Flores*`
        )
        db.users[sender].money -= apuesta
        const baraja  = crearBaraja()
        const jugador = [baraja.pop(), baraja.pop()]
        const dealer  = [baraja.pop(), baraja.pop()]
        blackjackActivo.set(sender, { jugador, dealer, baraja, apuesta })
        const valJug = valorMano(jugador)
        if (valJug === 21) {
            blackjackActivo.delete(sender)
            const ganancia = Math.floor(apuesta * 2.5)
            db.users[sender].money += ganancia
            return sendGame(conn, m,
                `🃏 *BLACKJACK*\n\n` +
                `Tu mano: ${mostrarMano(jugador)} = *${valJug}*\n` +
                `Dealer: ${mostrarMano(dealer)} = ${valorMano(dealer)}\n\n` +
                `🎉 *¡BLACKJACK! ×2.5*\n💰 Ganaste: *${ganancia} Flores*`
            )
        }
        return sendGame(conn, m,
            `🃏 *BLACKJACK* (Apuesta: ${apuesta})\n\n` +
            `Tu mano: ${mostrarMano(jugador)} = *${valJug}*\n` +
            `Dealer muestra: ${jugador[0].valor}${dealer[0].palo} [?]\n\n` +
            `_Usa *${px}pedir* para otra carta o *${px}plantarse*~ 🌸_`
        )
    }

    if (cmd === 'pedir' || cmd === 'hit') {
        const juego = blackjackActivo.get(sender)
        if (!juego) return sendGame(conn, m, `❌ No tienes partida activa. Usa *${px}blackjack*~`)
        juego.jugador.push(juego.baraja.pop())
        const val = valorMano(juego.jugador)
        if (val > 21) {
            blackjackActivo.delete(sender)
            return sendGame(conn, m,
                `🃏 Tu mano: ${mostrarMano(juego.jugador)} = *${val}*\n\n` +
                `💔 *¡Te pasaste!* Perdiste *${juego.apuesta} Flores*\n\n_La próxima~ 🌸_`
            )
        }
        if (val === 21) {
            blackjackActivo.delete(sender)
            const ganancia = juego.apuesta * 2
            if (!db.users[sender]) db.users[sender] = { money:0 }
            db.users[sender].money = (db.users[sender].money||0) + ganancia
            return sendGame(conn, m,
                `🃏 Tu mano: ${mostrarMano(juego.jugador)} = *${val}*\n\n` +
                `🎉 *¡21! Ganaste: ${ganancia} Flores*~ 🌸`
            )
        }
        return sendGame(conn, m,
            `🃏 Tu mano: ${mostrarMano(juego.jugador)} = *${val}*\n\n` +
            `_Usa *${px}pedir* para otra o *${px}plantarse*~ 🌸_`
        )
    }

    if (cmd === 'plantarse' || cmd === 'stand') {
        const juego = blackjackActivo.get(sender)
        if (!juego) return sendGame(conn, m, `❌ No tienes partida activa.`)
        blackjackActivo.delete(sender)
        const valJug = valorMano(juego.jugador)
        let valDeal  = valorMano(juego.dealer)
        while (valDeal < 17) { juego.dealer.push(juego.baraja.pop()); valDeal = valorMano(juego.dealer) }
        if (!db.users[sender]) db.users[sender] = { money:0 }
        let resultado = '', ganancia = 0
        if (valDeal > 21 || valJug > valDeal) {
            ganancia = juego.apuesta * 2; db.users[sender].money = (db.users[sender].money||0) + ganancia
            resultado = `🏆 *¡GANASTE!* +${ganancia} Flores`
        } else if (valJug === valDeal) {
            ganancia = juego.apuesta; db.users[sender].money = (db.users[sender].money||0) + ganancia
            resultado = `🤝 *EMPATE*. Recuperas ${ganancia} Flores`
        } else { resultado = `💔 *PERDISTE* ${juego.apuesta} Flores` }
        return sendGame(conn, m,
            `🃏 *RESULTADO BLACKJACK*\n\n` +
            `Tu mano: ${mostrarMano(juego.jugador)} = *${valJug}*\n` +
            `Dealer: ${mostrarMano(juego.dealer)} = *${valDeal}*\n\n` +
            `${resultado}\n\n_¡Bien jugado~ 🌸_`
        )
    }

    // ── ACERTIJO ──────────────────────────────────────────────────────────────
    if (cmd === 'acertijo' || cmd === 'riddle') {
        if (acertijoActivo.has(m.chat)) return sendGame(conn, m,
            `🧩 Ya hay un acertijo activo.\n_¡Escribe tu respuesta!_ 🌸`
        )
        const ac = ACERTIJOS[randInt(0, ACERTIJOS.length-1)]
        acertijoActivo.set(m.chat, {
            respuesta: ac.r,
            timer: setTimeout(() => {
                acertijoActivo.delete(m.chat)
                conn.sendMessage(m.chat, { text: `⏰ *¡Tiempo!*\nLa respuesta era: *${ac.r}* 🌸` })
            }, 45000)
        })
        return sendGame(conn, m,
            `🧩 *ACERTIJO ITSUKI*\n\n❓ ${ac.p}\n\n_Tienes 45 segundos~ 🌸_\n_Usa *${px}rendirme* para rendirte_`
        )
    }

    if (cmd === 'rendirme') {
        const ac = acertijoActivo.get(m.chat)
        if (!ac) return sendGame(conn, m, `❌ No hay acertijo activo~`)
        clearTimeout(ac.timer); acertijoActivo.delete(m.chat)
        return sendGame(conn, m, `🏳️ La respuesta era: *${ac.respuesta}* 🌸`)
    }
}

// ── BEFORE — respuestas de ahorcado y acertijo ────────────────────────────────
handler.before = async (m, { conn }) => {
    if (!m.body || m.body.startsWith(global.prefix||'#')) return false
    const chatId = m.chat
    const body   = m.body.trim().toLowerCase()

    // Ahorcado
    const juego = ahorcadoActivo.get(chatId)
    if (juego && body.length === 1 && /^[a-záéíóúüñ]$/i.test(body)) {
        const letra = body.toLowerCase()
        if (juego.adivinado.has(letra)) {
            await conn.sendMessage(chatId, { text: `⚠️ Ya probaste la letra *${letra}*~ 🌸` })
            return false
        }
        juego.adivinado.add(letra)
        const acierto = juego.palabra.includes(letra)
        if (!acierto) juego.intentos++
        const mostrar = juego.palabra.split('').map(l => juego.adivinado.has(l) ? l : '_').join(' ')
        if (!mostrar.includes('_')) {
            ahorcadoActivo.delete(chatId)
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🎮 ${global.botName||'Itsuki Nakano'}`, 'Ahorcado')
            await conn.sendMessage(chatId, { text: `🎉 *¡GANASTE!*\nLa palabra era: *${juego.palabra}* 🌸\n\n_¡Excelente~ 🌸_`, contextInfo: ctx })
            return true
        }
        if (juego.intentos >= 6) {
            ahorcadoActivo.delete(chatId)
            await conn.sendMessage(chatId, { text: `💀 *¡PERDISTE!*\n${dibujarAhorcado(6)}\n\nLa palabra era: *${juego.palabra}* 🌸` })
            return true
        }
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `🎮 ${global.botName||'Itsuki Nakano'}`, 'Ahorcado')
        await conn.sendMessage(chatId, {
            text: `${acierto?'✅':'❌'} Letra *${letra}* ${acierto?'encontrada':'no está'}\n\n${dibujarAhorcado(juego.intentos)}\n\n📝 \`${mostrar}\`\nLetras: ${[...juego.adivinado].join(', ')}\nErrores: ${juego.intentos}/6`,
            contextInfo: ctx
        })
        return false
    }

    // Acertijo
    const ac = acertijoActivo.get(chatId)
    if (ac && body.includes(ac.respuesta)) {
        clearTimeout(ac.timer); acertijoActivo.delete(chatId)
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `🧩 ${global.botName||'Itsuki Nakano'}`, 'Acertijo')
        await conn.sendMessage(chatId, {
            text: `✅ *¡CORRECTO!*\n@${m.sender.split('@')[0]} adivinó el acertijo! 🎉\nRespuesta: *${ac.respuesta}* 🌸`,
            mentions: [m.sender], contextInfo: ctx
        })
        return true
    }
    return false
}

handler.command = ['ahorcado','rendirahor','ppt','rps','dados','dice','moneda','coin','flipcoin','blackjack','bj','pedir','hit','plantarse','stand','acertijo','riddle','rendirme']
export default handler
