/**
 * POKEMON - ITSUKI NAKANO
 * #pokemon #atrapar #mypoke #pokepvp #pvp #pokeinfo #sellpoke #pokeshop #buypoke
 * #regalarpokemon #intercambiarpoke #curarpokemon #historial #poketop #toppower
 * Z0RT SYSTEMS 🌸
 */

const sendPoke = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `⚡ ${global.botName||'Itsuki Nakano'}`, 'Sistema Pokémon')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Lista de 50 pokémon con stats
const POKEDEX = [
    {id:1,  nombre:'Bulbasaur',  tipo:'Planta/Veneno', poder:45,  hp:45,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'},
    {id:4,  nombre:'Charmander', tipo:'Fuego',          poder:52,  hp:39,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png'},
    {id:7,  nombre:'Squirtle',   tipo:'Agua',           poder:48,  hp:44,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png'},
    {id:25, nombre:'Pikachu',    tipo:'Eléctrico',      poder:55,  hp:35,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'},
    {id:39, nombre:'Jigglypuff', tipo:'Normal/Hada',    poder:45,  hp:115, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png'},
    {id:52, nombre:'Meowth',     tipo:'Normal',         poder:45,  hp:40,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png'},
    {id:54, nombre:'Psyduck',    tipo:'Agua',           poder:52,  hp:50,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png'},
    {id:66, nombre:'Machop',     tipo:'Lucha',          poder:80,  hp:70,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png'},
    {id:94, nombre:'Gengar',     tipo:'Fantasma/Veneno',poder:65,  hp:60,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png'},
    {id:131,nombre:'Lapras',     tipo:'Agua/Hielo',     poder:60,  hp:130, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png'},
    {id:133,nombre:'Eevee',      tipo:'Normal',         poder:55,  hp:55,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png'},
    {id:143,nombre:'Snorlax',    tipo:'Normal',         poder:110, hp:160, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png'},
    {id:144,nombre:'Articuno',   tipo:'Hielo/Volador',  poder:85,  hp:90,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png'},
    {id:145,nombre:'Zapdos',     tipo:'Eléctrico/Volad',poder:90,  hp:90,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png'},
    {id:146,nombre:'Moltres',    tipo:'Fuego/Volador',  poder:100, hp:90,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png'},
    {id:149,nombre:'Dragonite',  tipo:'Dragón/Volador', poder:134, hp:91,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png'},
    {id:150,nombre:'Mewtwo',     tipo:'Psíquico',       poder:154, hp:106, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png'},
    {id:151,nombre:'Mew',        tipo:'Psíquico',       poder:100, hp:100, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png'},
    {id:152,nombre:'Chikorita',  tipo:'Planta',         poder:49,  hp:45,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png'},
    {id:155,nombre:'Cyndaquil',  tipo:'Fuego',          poder:52,  hp:39,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png'},
    {id:158,nombre:'Totodile',   tipo:'Agua',           poder:65,  hp:50,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png'},
    {id:196,nombre:'Espeon',     tipo:'Psíquico',       poder:65,  hp:65,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png'},
    {id:197,nombre:'Umbreon',    tipo:'Siniestro',      poder:65,  hp:95,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png'},
    {id:245,nombre:'Suicune',    tipo:'Agua',           poder:75,  hp:100, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/245.png'},
    {id:248,nombre:'Tyranitar',  tipo:'Roca/Siniestro', poder:134, hp:100, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png'},
    {id:249,nombre:'Lugia',      tipo:'Psíquico/Volad', poder:90,  hp:106, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png'},
    {id:250,nombre:'Ho-Oh',      tipo:'Fuego/Volador',  poder:130, hp:106, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png'},
    {id:384,nombre:'Rayquaza',   tipo:'Dragón/Volador', poder:150, hp:105, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png'},
    {id:445,nombre:'Garchomp',   tipo:'Dragón/Tierra',  poder:130, hp:108, img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png'},
    {id:448,nombre:'Lucario',    tipo:'Lucha/Acero',    poder:115, hp:70,  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png'},
]

const rareza = (poder) => {
    if (poder >= 150) return '🌟 Legendario'
    if (poder >= 120) return '💎 Épico'
    if (poder >= 90)  return '🔥 Raro'
    if (poder >= 60)  return '⭐ Poco común'
    return '🍃 Común'
}

const normalizeJid = (jid) => jid?.split('@')[0]?.split(':')[0] + '@s.whatsapp.net'

const ensureUser = (db, jid) => {
    if (!db.users)       db.users = {}
    if (!db.users[jid])  db.users[jid] = {}
    const u = db.users[jid]
    if (!u.pokemon)      u.pokemon = []
    if (!u.pokemonedas)  u.pokemonedas = 500
    if (!u.pokebatallas) u.pokebatallas = { ganadas:0, perdidas:0 }
    return u
}

// Estado activo por grupo
const pokeActivo   = new Map() // chatId → pokémon activo
const pvpPendiente = new Map() // targetJid → { retador, pokemon, timestamp }
const tradePend    = new Map() // targetJid → { de, miPoke, suPoke }
const pokeshop     = new Map() // chatId → [{ vendedor, pokemon, precio }]

const CD_POKEMON = 15 * 60 * 1000 // 15 min
const lastPokemon = new Map() // chatId → timestamp

let handler = async (m, { conn, command, text, args, db, isAdmin, isOwner }) => {
    const cmd    = command.toLowerCase()
    const sender = normalizeJid(m.sender)
    const u      = ensureUser(db, sender)
    const name   = m.pushName || sender.split('@')[0]
    const px     = global.prefix || '#'
    const chatId = m.chat

    // ── POKEMON (aparece uno aleatorio) ───────────────────────────────────────
    if (cmd === 'pokemon' || cmd === 'pokespawn') {
        const last = lastPokemon.get(chatId) || 0
        const diff = Date.now() - last
        if (diff < CD_POKEMON && !isAdmin && !isOwner) {
            const rem = Math.ceil((CD_POKEMON - diff) / 60000)
            return sendPoke(conn, m, `⏳ El próximo Pokémon aparece en *${rem} minutos*~ 🌸`)
        }
        const poke = POKEDEX[randInt(0, POKEDEX.length - 1)]
        pokeActivo.set(chatId, { ...poke, hpActual: poke.hp })
        lastPokemon.set(chatId, Date.now())

        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `⚡ ${global.botName||'Itsuki Nakano'}`, 'Pokémon Salvaje')
        await conn.sendMessage(chatId, {
            image: { url: poke.img },
            caption:
                `⚡ *¡UN POKÉMON SALVAJE APARECIÓ!*\n\n` +
                `🎴 *${poke.nombre}* #${poke.id}\n` +
                `🎭 Tipo: *${poke.tipo}*\n` +
                `❤️ HP: *${poke.hp}*\n` +
                `⚔️ Poder: *${poke.poder}*\n` +
                `${rareza(poke.poder)}\n\n` +
                `_Usa *${px}atrapar* para atraparlo~ 🌸_`,
            contextInfo: ctx
        }, { quoted: m })
        return
    }

    // ── ATRAPAR ───────────────────────────────────────────────────────────────
    if (cmd === 'atrapar' || cmd === 'catch') {
        const poke = pokeActivo.get(chatId)
        if (!poke) return sendPoke(conn, m, `❌ No hay ningún Pokémon salvaje ahora.\n_Usa *${px}pokemon* para invocar uno~ 🌸_`)
        // Probabilidad de captura basada en poder
        const prob = Math.max(0.2, 1 - (poke.poder / 200))
        if (Math.random() > prob) {
            return sendPoke(conn, m, `💨 *¡Se escapó!*\n*${poke.nombre}* fue demasiado rápido~ 🌸\n_¡Inténtalo de nuevo!_`)
        }
        pokeActivo.delete(chatId)
        u.pokemon.push({ ...poke, hpActual: poke.hp, capturado: new Date().toLocaleDateString('es-CO') })
        return sendPoke(conn, m,
            `🎊 *¡${name.toUpperCase()} ATRAPÓ A ${poke.nombre.toUpperCase()}!*\n\n` +
            `🎴 *${poke.nombre}* ${rareza(poke.poder)}\n` +
            `❤️ HP: *${poke.hp}* | ⚔️ Poder: *${poke.poder}*\n\n` +
            `_¡Hazte con todos!~ 🌸_`
        )
    }

    // ── MYPOKE ────────────────────────────────────────────────────────────────
    if (cmd === 'mypoke' || cmd === 'mispokemon') {
        if (!u.pokemon.length) return sendPoke(conn, m, `❌ No tienes Pokémon aún.\n_Usa *${px}pokemon* para atrapar uno~ 🌸_`)
        const lista = u.pokemon.slice(0,20).map((p, i) =>
            `${i+1}. *${p.nombre}* ${rareza(p.poder)} — ❤️${p.hpActual}/${p.hp} ⚔️${p.poder}`
        ).join('\n')
        return sendPoke(conn, m,
            `⚡ *MIS POKÉMON — ${name}*\n\n${lista}\n\n` +
            `📊 Total: *${u.pokemon.length}* | 💰 Pokemonedas: *${u.pokemonedas}*\n` +
            `🏆 Batallas: ✅${u.pokebatallas.ganadas} ❌${u.pokebatallas.perdidas}`
        )
    }

    // ── POKEINFO ──────────────────────────────────────────────────────────────
    if (cmd === 'pokeinfo') {
        const query = (text||'').trim().toLowerCase()
        if (!query) return sendPoke(conn, m, `❌ Uso: *${px}pokeinfo <nombre>*`)
        try {
            const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.replace(/\s+/g,'-')}`)
            const data = await res.json()
            const nombre = data.name.charAt(0).toUpperCase()+data.name.slice(1)
            const tipos  = data.types.map(t=>t.type.name).join(', ')
            const stats  = data.stats.map(s=>`${s.stat.name}: *${s.base_stat}*`).join(' | ')
            const img    = data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default
            const thumb  = await global.getBannerThumb()
            const ctx    = global.getNewsletterCtx(thumb,`⚡ ${global.botName||'Itsuki Nakano'}`,'Pokédex')
            await conn.sendMessage(chatId, {
                image: { url: img },
                caption: `⚡ *#${data.id} ${nombre}*\n🎭 ${tipos}\n📏 ${data.height/10}m | 💪 ${data.weight/10}kg\n📊 ${stats}`,
                contextInfo: ctx
            }, { quoted: m })
        } catch { return sendPoke(conn, m, `❌ Pokémon *${text}* no encontrado~`) }
        return
    }

    // ── POKEPVP (retar) ───────────────────────────────────────────────────────
    if (cmd === 'pokepvp') {
        const target   = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : null
        const pokeName = (text||'').replace(/@\d+/g,'').trim().toLowerCase()
        if (!target || !pokeName) return sendPoke(conn, m,
            `⚔️ Uso: *${px}pokepvp <mi_pokemon> @usuario*\n_Ejemplo: ${px}pokepvp pikachu @rival_ 🌸`
        )
        if (target === sender) return sendPoke(conn, m, `😂 No puedes retarte a ti mismo~`)
        const miPoke = u.pokemon.find(p => p.nombre.toLowerCase() === pokeName)
        if (!miPoke) return sendPoke(conn, m, `❌ No tienes a *${pokeName}*. Usa *${px}mypoke* para ver tus Pokémon~`)
        if ((miPoke.hpActual||0) <= 0) return sendPoke(conn, m, `❌ *${miPoke.nombre}* está debilitado. Usa *${px}curarpokemon ${miPoke.nombre}* primero~`)

        pvpPendiente.set(target, { retador:sender, pokeName:miPoke.nombre, miPoke, timestamp:Date.now() })
        setTimeout(() => pvpPendiente.delete(target), 60000)

        return conn.sendMessage(chatId, {
            text:
                `⚔️ *¡RETO POKÉMON!*\n\n` +
                `@${sender.split('@')[0]} reta a @${target.split('@')[0]}!\n` +
                `🎴 Con: *${miPoke.nombre}* (Poder: ${miPoke.poder})\n\n` +
                `_@${target.split('@')[0]}, usa *${px}pvp <tu_pokemon>* para aceptar~ 🌸_\n_Tienes 60 segundos_`,
            mentions: [sender, target],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`⚔️ ${global.botName||'Itsuki Nakano'}`,'PvP Pokémon') })())
        }, { quoted: m })
    }

    // ── PVP (aceptar) ─────────────────────────────────────────────────────────
    if (cmd === 'pvp') {
        const reto     = pvpPendiente.get(sender)
        if (!reto) return sendPoke(conn, m, `❌ No tienes ningún reto pendiente~`)
        const pokeName = (text||'').trim().toLowerCase()
        if (!pokeName) return sendPoke(conn, m, `⚔️ Indica con qué Pokémon peleas: *${px}pvp <nombre>*`)
        const miPoke = u.pokemon.find(p => p.nombre.toLowerCase() === pokeName)
        if (!miPoke) return sendPoke(conn, m, `❌ No tienes a *${pokeName}*~`)
        if ((miPoke.hpActual||0) <= 0) return sendPoke(conn, m, `❌ *${miPoke.nombre}* está debilitado~`)

        pvpPendiente.delete(sender)
        ensureUser(db, reto.retador)
        const retadorUser = db.users[reto.retador]

        // Calcular batalla
        const pokeA = reto.miPoke   // retador
        const pokeB = miPoke         // aceptante
        const scoreA = pokeA.poder + randInt(-10, 10)
        const scoreB = pokeB.poder  + randInt(-10, 10)

        let ganadorJid, perdedorJid, ganadorPoke, perdedorPoke
        if (scoreA >= scoreB) {
            ganadorJid=reto.retador; perdedorJid=sender
            ganadorPoke=pokeA; perdedorPoke=pokeB
        } else {
            ganadorJid=sender; perdedorJid=reto.retador
            ganadorPoke=pokeB; perdedorPoke=pokeA
        }

        // Actualizar stats
        ensureUser(db, ganadorJid).pokebatallas.ganadas++
        ensureUser(db, perdedorJid).pokebatallas.perdidas++
        // Debilitar pokémon perdedor
        const perdedorUserPokemon = db.users[perdedorJid].pokemon
        const perdIdx = perdedorUserPokemon?.findIndex(p=>p.nombre===perdedorPoke.nombre)
        if (perdIdx >= 0) perdedorUserPokemon[perdIdx].hpActual = 0
        // Pokemonedas
        const premio = randInt(50,150)
        db.users[ganadorJid].pokemonedas = (db.users[ganadorJid].pokemonedas||0) + premio
        db.users[perdedorJid].pokemonedas = Math.max(0,(db.users[perdedorJid].pokemonedas||0) - Math.floor(premio*0.5))

        return conn.sendMessage(chatId, {
            text:
                `⚔️ *¡BATALLA POKÉMON!*\n\n` +
                `🔴 @${reto.retador.split('@')[0]}: *${pokeA.nombre}* (${scoreA} pts)\n` +
                `🔵 @${sender.split('@')[0]}: *${pokeB.nombre}* (${scoreB} pts)\n\n` +
                `🏆 *¡GANÓ @${ganadorJid.split('@')[0]}!*\n` +
                `🎴 *${ganadorPoke.nombre}* venció a *${perdedorPoke.nombre}*\n\n` +
                `💰 Premio: *+${premio} Pokemonedas*\n` +
                `💔 *${perdedorPoke.nombre}* fue debilitado. Usa *${px}curarpokemon* para recuperarlo~`,
            mentions: [reto.retador, sender],
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`⚔️ ${global.botName||'Itsuki Nakano'}`,'PvP Pokémon') })())
        }, { quoted: m })
    }

    // ── SELLPOKE ──────────────────────────────────────────────────────────────
    if (cmd === 'sellpoke' || cmd === 'venderpokemon') {
        const pokeName = args[0]?.toLowerCase()
        const precio   = parseInt(args[1]) || 0
        if (!pokeName || !precio) return sendPoke(conn, m, `💰 Uso: *${px}sellpoke <pokemon> <precio>*`)
        const idx = u.pokemon.findIndex(p => p.nombre.toLowerCase() === pokeName)
        if (idx < 0) return sendPoke(conn, m, `❌ No tienes ese Pokémon~`)
        const poke = u.pokemon.splice(idx, 1)[0]
        if (!pokeshop.has(chatId)) pokeshop.set(chatId, [])
        pokeshop.get(chatId).push({ vendedor:sender, nombre:name, poke, precio })
        return sendPoke(conn, m,
            `🏪 *¡${poke.nombre} EN VENTA!*\n\n` +
            `💰 Precio: *${precio} Pokemonedas*\n` +
            `_Usa *${px}pokeshop* para ver la tienda~ 🌸_`
        )
    }

    // ── POKESHOP ──────────────────────────────────────────────────────────────
    if (cmd === 'pokeshop') {
        const shop = pokeshop.get(chatId) || []
        if (!shop.length) return sendPoke(conn, m, `🏪 La tienda está vacía.\n_Usa *${px}sellpoke* para vender~ 🌸_`)
        const lista = shop.map((s,i) =>
            `${i+1}. *${s.poke.nombre}* ${rareza(s.poke.poder)} ⚔️${s.poke.poder}\n   💰 *${s.precio}* Pokemonedas | De: @${s.vendedor.split('@')[0]}`
        ).join('\n\n')
        return conn.sendMessage(chatId, {
            text: `🏪 *TIENDA POKÉMON*\n\n${lista}\n\n_Usa *${px}buypoke <número>* para comprar~ 🌸_`,
            mentions: shop.map(s=>s.vendedor),
            contextInfo: (await (async()=>{ const t=await global.getBannerThumb(); return global.getNewsletterCtx(t,`🏪 ${global.botName||'Itsuki Nakano'}`,'PokéShop') })())
        }, { quoted: m })
    }

    // ── BUYPOKE ───────────────────────────────────────────────────────────────
    if (cmd === 'buypoke') {
        const idx  = parseInt(args[0]) - 1
        const shop = pokeshop.get(chatId) || []
        if (isNaN(idx)||idx<0||idx>=shop.length) return sendPoke(conn, m, `❌ Número inválido. Usa *${px}pokeshop* para ver~`)
        const item = shop[idx]
        if (item.vendedor === sender) return sendPoke(conn, m, `😂 No puedes comprarte tu propio Pokémon~`)
        if ((u.pokemonedas||0) < item.precio) return sendPoke(conn, m,
            `❌ No tienes suficiente\n💰 Necesitas: *${item.precio}* | Tienes: *${u.pokemonedas||0}*`
        )
        shop.splice(idx, 1)
        u.pokemonedas -= item.precio
        ensureUser(db, item.vendedor).pokemonedas += item.precio
        u.pokemon.push({ ...item.poke, hpActual: item.poke.hp })
        return sendPoke(conn, m,
            `✅ *¡COMPRA EXITOSA!*\n\n` +
            `🎴 *${item.poke.nombre}* es tuyo ahora~ 🌸\n` +
            `💰 Pagaste: *${item.precio} Pokemonedas*`
        )
    }

    // ── CURAR POKEMON ─────────────────────────────────────────────────────────
    if (cmd === 'curarpokemon' || cmd === 'healingpoke') {
        const pokeName = (text||'').trim().toLowerCase()
        if (!pokeName) return sendPoke(conn, m, `💊 Uso: *${px}curarpokemon <nombre>*`)
        const idx = u.pokemon.findIndex(p => p.nombre.toLowerCase() === pokeName)
        if (idx < 0) return sendPoke(conn, m, `❌ No tienes ese Pokémon~`)
        if ((u.pokemon[idx].hpActual||0) >= u.pokemon[idx].hp) return sendPoke(conn, m, `✅ *${u.pokemon[idx].nombre}* ya está sa