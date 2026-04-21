/**
 * INFORMACIÓN - ITSUKI NAKANO
 * #crypto #noticias #ip #color #fecha #tiempo #moneda #pais #definir
 * Z0RT SYSTEMS 🌸
 */

const sendInfo = async (conn, m, text, isError = false) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        (isError ? '❌ ' : 'ℹ️ ') + (global.botName || 'Itsuki Nakano'),
        'Información'
    )
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

const apiGet = async (url, timeout = 15000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
    } finally { clearTimeout(timer) }
}

let handler = async (m, { conn, command, text, args }) => {
    const cmd   = command.toLowerCase()
    const query = (text || '').trim()
    const px    = global.prefix || '#'

    // ── CRYPTO ────────────────────────────────────────────────────────────────
    if (cmd === 'crypto' || cmd === 'cripto') {
        const coin = (args[0] || 'bitcoin').toLowerCase()
        const idMap = { btc:'bitcoin', eth:'ethereum', doge:'dogecoin', bnb:'binancecoin', sol:'solana', ada:'cardano', xrp:'ripple', matic:'matic-network', ltc:'litecoin', usdt:'tether' }
        const coinId = idMap[coin] || coin
        await m.react('💹')
        try {
            const r = await apiGet(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,eur&include_24hr_change=true&include_market_cap=true`)
            const data = r[coinId]
            if (!data) throw new Error(`Cripto "${coin}" no encontrada`)
            const cambio = data.usd_24h_change?.toFixed(2) || '0'
            const emoji  = parseFloat(cambio) >= 0 ? '📈' : '📉'
            return sendInfo(conn, m,
                `💹 *CRIPTO — ${coinId.toUpperCase()}*\n\n` +
                `💵 USD: *$${data.usd?.toLocaleString() || 'N/A'}*\n` +
                `💶 EUR: *€${data.eur?.toLocaleString() || 'N/A'}*\n` +
                `${emoji} Cambio 24h: *${cambio}%*\n` +
                `💰 Market Cap: *$${(data.usd_market_cap/1e9).toFixed(2)}B*\n\n` +
                `_Fuente: CoinGecko~ 🌸_`
            )
        } catch (e) {
            await m.react('❌')
            return sendInfo(conn, m, `❌ Cripto *${coin}* no encontrada.\n_IDs: btc, eth, doge, bnb, sol, ada, xrp_ 🌸`, true)
        }
    }

    // ── MONEDA / CONVERSIÓN ───────────────────────────────────────────────────
    if (cmd === 'moneda' || cmd === 'convert' || cmd === 'cambio') {
        if (!query) return sendInfo(conn, m,
            `💱 *CONVERSIÓN DE MONEDA*\n\nUso: *${px}moneda <cantidad> <de> <a>*\n_Ejemplo: ${px}moneda 100 USD COP_ 🌸`
        )
        const parts = query.split(' ')
        const amount = parseFloat(parts[0]) || 1
        const from   = (parts[1] || 'USD').toUpperCase()
        const to     = (parts[2] || 'COP').toUpperCase()
        await m.react('💱')
        try {
            const r = await apiGet(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`)
            if (!r?.rates) throw new Error('Moneda no válida')
            const result = Object.values(r.rates)[0]
            return sendInfo(conn, m,
                `💱 *CONVERSIÓN*\n\n` +
                `💵 ${amount} *${from}* = *${result?.toLocaleString('es-CO', {maximumFractionDigits:2})} ${to}*\n\n` +
                `📅 Fecha: ${r.date}\n_Fuente: Frankfurter~ 🌸_`
            )
        } catch (e) {
            await m.react('❌')
            return sendInfo(conn, m, `❌ No pude convertir *${from}* a *${to}*\n_Verifica los códigos de moneda_ 🌸`, true)
        }
    }

    // ── IP INFO ───────────────────────────────────────────────────────────────
    if (cmd === 'ip' || cmd === 'ipinfo') {
        const ip = args[0] || ''
        await m.react('🌐')
        try {
            const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'
            const r   = await apiGet(url)
            if (r.error) throw new Error(r.reason || 'IP inválida')
            return sendInfo(conn, m,
                `🌐 *IP INFO${ip ? ` — ${ip}` : ' (Tu IP)'}*\n\n` +
                `📍 IP: *${r.ip}*\n` +
                `🌍 País: *${r.country_name} ${r.country_code}*\n` +
                `🏙️ Ciudad: *${r.city || 'N/A'}*\n` +
                `📡 ISP: *${r.org || 'N/A'}*\n` +
                `🕐 Zona horaria: *${r.timezone || 'N/A'}*\n` +
                `📍 Coords: *${r.latitude}, ${r.longitude}*\n\n` +
                `_Fuente: ipapi.co~ 🌸_`
            )
        } catch (e) {
            await m.react('❌')
            return sendInfo(conn, m, `❌ No pude obtener info de la IP *${ip||'tuya'}*~ 🌸`, true)
        }
    }

    // ── COLOR ─────────────────────────────────────────────────────────────────
    if (cmd === 'color') {
        const hex = (args[0] || '').replace('#','') || Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')
        const r   = parseInt(hex.slice(0,2),16)
        const g   = parseInt(hex.slice(2,4),16)
        const b   = parseInt(hex.slice(4,6),16)
        if (isNaN(r)||isNaN(g)||isNaN(b)) return sendInfo(conn, m, `❌ Color inválido. Usa formato HEX: *${px}color FF69B4*`)
        const luminancia = (0.299*r + 0.587*g + 0.114*b)
        const nombre = luminancia < 85 ? 'Color oscuro' : luminancia < 170 ? 'Color medio' : 'Color claro'
        return sendInfo(conn, m,
            `🎨 *COLOR INFO*\n\n` +
            `🎨 HEX: *#${hex.toUpperCase()}*\n` +
            `🔴 R: *${r}* | 🟢 G: *${g}* | 🔵 B: *${b}*\n` +
            `💡 Luminancia: *${luminancia.toFixed(0)}*\n` +
            `📝 Tipo: *${nombre}*\n\n` +
            `_Vista previa: https://singlecolorimage.com/get/${hex}/100x100_ 🌸`
        )
    }

    // ── PAÍS INFO ─────────────────────────────────────────────────────────────
    if (cmd === 'pais' || cmd === 'country') {
        if (!query) return sendInfo(conn, m, `🌍 Uso: *${px}pais <nombre>*\n_Ejemplo: ${px}pais Colombia_ 🌸`)
        await m.react('🌍')
        try {
            const r = await apiGet(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=false`)
            if (!Array.isArray(r) || !r[0]) throw new Error('País no encontrado')
            const p       = r[0]
            const nombre  = p.name?.common || query
            const capital = p.capital?.[0] || 'N/A'
            const pob     = (p.population||0).toLocaleString()
            const region  = p.region || 'N/A'
            const idiomas = Object.values(p.languages||{}).slice(0,3).join(', ')
            const monedas = Object.values(p.currencies||{}).map(c=>c.name).join(', ')
            const bandera = p.flags?.png || ''
            const thumb   = await global.getBannerThumb()
            const ctx     = global.getNewsletterCtx(thumb, `🌍 ${global.botName||'Itsuki Nakano'}`, 'Info de País')
            if (bandera) {
                await conn.sendMessage(m.chat, {
                    image: { url: bandera },
                    caption:
                        `🌍 *${nombre}* ${p.flag||''}\n\n` +
                        `🏙️ Capital: *${capital}*\n` +
                        `👥 Población: *${pob}*\n` +
                        `🗺️ Región: *${region}*\n` +
                        `🗣️ Idiomas: *${idiomas||'N/A'}*\n` +
                        `💰 Moneda: *${monedas||'N/A'}*\n\n` +
                        `_Fuente: RestCountries~ 🌸_`,
                    contextInfo: ctx
                }, { quoted: m })
            } else {
                await sendInfo(conn, m, `🌍 *${nombre}*\n🏙️ ${capital} | 👥 ${pob} | 🗺️ ${region}`)
            }
            await m.react('✅')
        } catch {
            await m.react('❌')
            return sendInfo(conn, m, `❌ No encontré info de *${query}*~ 🌸`, true)
        }
        return
    }

    // ── DEFINIR ───────────────────────────────────────────────────────────────
    if (cmd === 'definir' || cmd === 'definicion' || cmd === 'define') {
        if (!query) return sendInfo(conn, m, `📖 Uso: *${px}definir <palabra>*\n_Ejemplo: ${px}definir efímero_ 🌸`)
        await m.react('📖')
        try {
            const r = await apiGet(`https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(query)}`)
            if (!Array.isArray(r) || !r[0]) throw new Error('No encontrado')
            const entry = r[0]
            const defs  = entry.meanings?.[0]?.definitions?.slice(0,3) || []
            const texto = defs.map((d,i) => `${i+1}. ${d.definition}${d.example?`\n   _"${d.example}"_`:''}`).join('\n\n')
            return sendInfo(conn, m,
                `📖 *${entry.word?.toUpperCase() || query}*\n\n` +
                `${texto || 'Sin definición disponible'}\n\n` +
                `_Fuente: DictionaryAPI~ 🌸_`
            )
        } catch {
            // Fallback con IA simple
            await m.react('❌')
            return sendInfo(conn, m, `❌ No encontré la definición de *${query}*\n_Intenta en inglés o verifica la escritura~ 🌸_`, true)
        }
    }

    // ── TIEMPO ACTUAL ─────────────────────────────────────────────────────────
    if (cmd === 'tiempo' || cmd === 'hora' || cmd === 'fecha') {
        const zonas = {
            colombia: 'America/Bogota', mexico: 'America/Mexico_City',
            argentina: 'America/Argentina/Buenos_Aires', españa: 'Europe/Madrid',
            usa: 'America/New_York', japon: 'Asia/Tokyo', peru: 'America/Lima',
            chile: 'America/Santiago', venezuela: 'America/Caracas'
        }
        const zona     = zonas[query.toLowerCase()] || 'America/Bogota'
        const nombre   = query || 'Colombia'
        const ahora    = new Date()
        const horaLocal = new Intl.DateTimeFormat('es-CO', {
            timeZone: zona, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
        }).format(ahora)
        const fechaLocal = new Intl.DateTimeFormat('es-CO', {
            timeZone: zona, weekday:'long', day:'numeric', month:'long', year:'numeric'
        }).format(ahora)
        return sendInfo(conn, m,
            `🕐 *TIEMPO ACTUAL — ${nombre.toUpperCase()}*\n\n` +
            `⏰ Hora: *${horaLocal}*\n` +
            `📅 Fecha: *${fechaLocal}*\n` +
            `🌍 Zona: *${zona}*\n\n` +
            `_Zonas: colombia, mexico, argentina, españa, usa, japon, peru, chile_ 🌸`
        )
    }

    // ── POKEDEX ───────────────────────────────────────────────────────────────
    if (cmd === 'pokedex' || cmd === 'pokemon') {
        if (!query) return sendInfo(conn, m, `⚡ Uso: *${px}pokedex <nombre o número>*\n_Ejemplo: ${px}pokedex pikachu_ 🌸`)
        await m.react('⚡')
        try {
            const r = await apiGet(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase().replace(/\s+/g,'-')}`)
            if (!r?.name) throw new Error('Pokémon no encontrado')
            const nombre = r.name.charAt(0).toUpperCase() + r.name.slice(1)
            const tipos  = r.types?.map(t => t.type.name).join(', ') || 'N/A'
            const stats  = r.stats?.slice(0,4).map(s => `${s.stat.name}: *${s.base_stat}*`).join(' | ') || 'N/A'
            const img    = r.sprites?.other?.['official-artwork']?.front_default || r.sprites?.front_default
            const thumb  = await global.getBannerThumb()
            const ctx    = global.getNewsletterCtx(thumb, `⚡ ${global.botName||'Itsuki Nakano'}`, 'Pokédex')
            if (img) {
                await conn.sendMessage(m.chat, {
                    image: { url: img },
                    caption:
                        `⚡ *#${r.id} ${nombre}*\n\n` +
                        `🎭 Tipo: *${tipos}*\n` +
                        `📏 Altura: *${r.height/10}m* | 💪 Peso: *${r.weight/10}kg*\n` +
                        `📊 ${stats}\n\n` +
                        `_¡Hazte con todos!~ 🌸_`,
                    contextInfo: ctx
                }, { quoted: m })
            } else {
                await sendInfo(conn, m, `⚡ *#${r.id} ${nombre}*\n🎭 ${tipos}\n📊 ${stats}`)
            }
            await m.react('✅')
        } catch {
            await m.react('❌')
            return sendInfo(conn, m, `❌ No encontré el Pokémon *${query}*~ 🌸`, true)
        }
        return
    }
}

handler.command = ['crypto','cripto','moneda','convert','cambio','ip','ipinfo','color','pais','country','definir','definicion','define','tiempo','hora','fecha','pokedex','pokemon']
export default handler
