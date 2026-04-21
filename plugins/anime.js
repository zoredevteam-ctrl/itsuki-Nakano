/**
 * ANIME - ITSUKI NAKANO
 * #waifu #husbando #personaje #buscaranime #quoteanime #anilist #animetop
 * Z0RT SYSTEMS 🌸
 */

const sendAnime = async (conn, m, text, isError = false) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        (isError ? '❌ ' : '🌸 ') + (global.botName || 'Itsuki Nakano'),
        'Mundo Anime'
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

const QUOTES_ANIME = [
    { quote: 'No importa cuántas veces caigas, lo importante es cuántas veces te levantas.', personaje: 'Naruto Uzumaki', anime: 'Naruto' },
    { quote: 'Si no puedes encontrar una razón para seguir luchando, entonces busca una nueva razón.', personaje: 'Kirito', anime: 'Sword Art Online' },
    { quote: 'Las personas más fuertes no son las que siempre ganan, sino las que no se rinden cuando pierden.', personaje: 'Gon Freecss', anime: 'Hunter x Hunter' },
    { quote: 'El fracaso no es el final, sino el comienzo de algo nuevo.', personaje: 'Deku', anime: 'My Hero Academia' },
    { quote: 'Nada es imposible cuando tienes la voluntad de lograrlo.', personaje: 'Rock Lee', anime: 'Naruto' },
    { quote: 'Los sueños no desaparecen si te quedas dormido. Desaparecen cuando te rindes.', personaje: 'Monkey D. Luffy', anime: 'One Piece' },
    { quote: 'El tiempo que disfrutas perdiendo no es tiempo perdido.', personaje: 'Haruhi Suzumiya', anime: 'Haruhi Suzumiya' },
    { quote: 'Vivir es suficiente razón para luchar.', personaje: 'Erwin Smith', anime: 'Attack on Titan' },
    { quote: 'No hay final feliz para aquellos que desperdician su potencial.', personaje: 'Aizawa', anime: 'My Hero Academia' },
    { quote: 'La oscuridad en el corazón de la gente nace de la desesperación.', personaje: 'Itachi Uchiha', anime: 'Naruto' },
    { quote: 'El esfuerzo supera al talento cuando el talento no trabaja duro.', personaje: 'Kageyama', anime: 'Haikyuu' },
    { quote: 'Estudia con dedicación y los resultados vendrán solos.', personaje: 'Itsuki Nakano', anime: 'The Quintessential Quintuplets' }
]

const PERSONAJES_ANIME = [
    { nombre:'Naruto Uzumaki', anime:'Naruto', descripcion:'Ninja de Konoha que sueña con ser Hokage. Determinado y nunca se rinde.', img:'https://api.waifu.pics/sfw/waifu' },
    { nombre:'Itsuki Nakano', anime:'The Quintessential Quintuplets', descripcion:'La quinta quintilliza. Estudiosa, seria y amante de la historia.', img:'' },
    { nombre:'Zero Two', anime:'Darling in the FranXX', descripcion:'Piloto de FranXX con sangre klaxosaur. Carismática y apasionada.', img:'' },
    { nombre:'Rem', anime:'Re:Zero', descripcion:'Demi-humana que trabaja como sirvienta. Leal y combatiente feroz.', img:'' },
    { nombre:'Tohru Honda', anime:'Fruits Basket', descripcion:'Chica optimista que vive con la familia Soma. Compasiva y alegre.', img:'' }
]

let handler = async (m, { conn, command, text, args }) => {
    const cmd   = command.toLowerCase()
    const query = (text || '').trim()
    const px    = global.prefix || '#'

    // ── WAIFU ─────────────────────────────────────────────────────────────────
    if (cmd === 'waifu' || cmd === 'neko' || cmd === 'foxgirl') {
        await m.react('🌸')
        try {
            const tipos = { waifu:'waifu', neko:'neko', foxgirl:'neko' }
            const tipo  = tipos[cmd] || 'waifu'
            const r     = await apiGet(`https://api.waifu.pics/sfw/${tipo}`)
            if (!r?.url) throw new Error('Sin imagen')
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🌸 ${global.botName||'Itsuki Nakano'}`, 'Anime Art')
            await conn.sendMessage(m.chat, {
                image: { url: r.url },
                caption: `🌸 *${cmd.toUpperCase()}*\n\n_Una imagen para alegrar tu día~ 🌸_`,
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendAnime(conn, m, `❌ No pude obtener la imagen~ 🌸`, true)
        }
        return
    }

    // ── HUSBANDO ──────────────────────────────────────────────────────────────
    if (cmd === 'husbando') {
        await m.react('💙')
        try {
            const r = await apiGet('https://api.waifu.pics/sfw/waifu')
            if (!r?.url) throw new Error('Sin imagen')
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `💙 ${global.botName||'Itsuki Nakano'}`, 'Anime Art')
            await conn.sendMessage(m.chat, {
                image: { url: r.url },
                caption: `💙 *HUSBANDO*\n\n_Un personaje especial para ti~ 🌸_`,
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendAnime(conn, m, `❌ Error al obtener imagen~ 🌸`, true)
        }
        return
    }

    // ── QUOTE ANIME ───────────────────────────────────────────────────────────
    if (cmd === 'quoteanime' || cmd === 'fraseAnime' || cmd === 'qanime') {
        const q = QUOTES_ANIME[Math.floor(Math.random() * QUOTES_ANIME.length)]
        return sendAnime(conn, m,
            `✨ *QUOTE ANIME*\n\n` +
            `_"${q.quote}"_\n\n` +
            `— *${q.personaje}*\n` +
            `📺 ${q.anime}\n\n` +
            `_Una frase para inspirarte~ 🌸_`
        )
    }

    // ── BUSCAR ANIME ──────────────────────────────────────────────────────────
    if (cmd === 'buscaranime' || cmd === 'anime' || cmd === 'anilist') {
        if (!query) return sendAnime(conn, m, `🔍 Uso: *${px}anime <nombre>*\n_Ejemplo: ${px}anime Naruto_ 🌸`)
        await m.react('🔍')
        try {
            const gql = `
                query ($search: String) {
                    Media(search: $search, type: ANIME) {
                        title { romaji english native }
                        description averageScore episodes status
                        genres startDate { year } endDate { year }
                        coverImage { large }
                        siteUrl
                    }
                }
            `
            const res  = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ query: gql, variables: { search: query } })
            })
            const data = await res.json()
            const a    = data?.data?.Media
            if (!a) throw new Error('Anime no encontrado')

            const desc    = (a.description || 'Sin descripción').replace(/<[^>]*>/g, '').slice(0, 300)
            const titulo  = a.title.english || a.title.romaji || query
            const generos = (a.genres || []).slice(0, 4).join(', ')
            const anioI   = a.startDate?.year || 'N/A'
            const anioF   = a.endDate?.year || (a.status === 'RELEASING' ? 'En emisión' : 'N/A')

            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `📺 ${global.botName||'Itsuki Nakano'}`, 'AniList')
            ctx.externalAdReply.sourceUrl = a.siteUrl || ''

            if (a.coverImage?.large) {
                await conn.sendMessage(m.chat, {
                    image: { url: a.coverImage.large },
                    caption:
                        `📺 *${titulo}*\n` +
                        (a.title.native ? `🇯🇵 ${a.title.native}\n` : '') +
                        `\n⭐ Puntuación: *${a.averageScore || 'N/A'}/100*\n` +
                        `📦 Episodios: *${a.episodes || 'N/A'}*\n` +
                        `📅 Año: *${anioI} → ${anioF}*\n` +
                        `🎭 Géneros: *${generos || 'N/A'}*\n` +
                        `📊 Estado: *${a.status || 'N/A'}*\n\n` +
                        `📝 ${desc}...\n\n` +
                        `🔗 ${a.siteUrl || ''}\n\n` +
                        `_Búsqueda con AniList~ 🌸_`,
                    contextInfo: ctx
                }, { quoted: m })
            } else {
                await sendAnime(conn, m,
                    `📺 *${titulo}*\n\n` +
                    `⭐ *${a.averageScore||'N/A'}/100* | 📦 *${a.episodes||'N/A'} eps*\n` +
                    `📅 *${anioI}* | 🎭 *${generos||'N/A'}*\n\n` +
                    `📝 ${desc}...\n\n🔗 ${a.siteUrl||''}`
                )
            }
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            return sendAnime(conn, m, `❌ No encontré el anime *${query}*~ 🌸`, true)
        }
        return
    }

    // ── PERSONAJE ANIME ───────────────────────────────────────────────────────
    if (cmd === 'personaje' || cmd === 'character') {
        if (!query) {
            const p = PERSONAJES_ANIME[Math.floor(Math.random() * PERSONAJES_ANIME.length)]
            return sendAnime(conn, m,
                `👤 *PERSONAJE ALEATORIO*\n\n` +
                `🌸 *${p.nombre}*\n📺 ${p.anime}\n\n📝 ${p.descripcion}\n\n` +
                `_Usa *${px}personaje <nombre>* para buscar uno específico~ 🌸_`
            )
        }
        try {
            const gql = `
                query ($search: String) {
                    Character(search: $search) {
                        name { full native }
                        description
                        image { large }
                        siteUrl
                        media(sort: POPULARITY_DESC, perPage: 1) {
                            nodes { title { romaji english } }
                        }
                    }
                }
            `
            const res  = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ query: gql, variables: { search: query } })
            })
            const data = await res.json()
            const c    = data?.data?.Character
            if (!c) throw new Error('No encontrado')
            const desc  = (c.description || 'Sin descripción').replace(/<[^>]*>/g, '').slice(0, 250)
            const anime = c.media?.nodes?.[0]?.title?.english || c.media?.nodes?.[0]?.title?.romaji || 'N/A'
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `👤 ${global.botName||'Itsuki Nakano'}`, 'Personaje Anime')
            if (c.image?.large) {
                await conn.sendMessage(m.chat, {
                    image: { url: c.image.large },
                    caption:
                        `👤 *${c.name.full}*\n` +
                        (c.name.native ? `🇯🇵 ${c.name.native}\n` : '') +
                        `📺 *${anime}*\n\n📝 ${desc}...\n\n🔗 ${c.siteUrl||''}\n\n_Búsqueda con AniList~ 🌸_`,
                    contextInfo: ctx
                }, { quoted: m })
            } else {
                await sendAnime(conn, m, `👤 *${c.name.full}*\n📺 ${anime}\n\n📝 ${desc}`)
            }
            await m.react('✅')
        } catch {
            return sendAnime(conn, m, `❌ No encontré al personaje *${query}*~ 🌸`, true)
        }
        return
    }

    // ── ANIME RECOMENDACIÓN ALEATORIA ─────────────────────────────────────────
    if (cmd === 'animetop' || cmd === 'recomanime') {
        const animes = [
            'Fullmetal Alchemist: Brotherhood','Death Note','Attack on Titan','One Piece',
            'Naruto Shippuden','My Hero Academia','Demon Slayer','Jujutsu Kaisen',
            'Hunter x Hunter','Sword Art Online','Re:Zero','Overlord',
            'The Quintessential Quintuplets','Fruits Basket','Your Lie in April',
            'Violet Evergarden','A Silent Voice','Spirited Away','Your Name'
        ]
        const seleccion = [...animes].sort(()=>Math.random()-0.5).slice(0,5)
        return sendAnime(conn, m,
            `📺 *TOP ANIMES RECOMENDADOS*\n\n` +
            seleccion.map((a,i) => `${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} *${a}*`).join('\n') +
            '\n\n_Usa *${px}anime <nombre>* para más info~ 🌸_'.replace('${px}', px)
        )
    }
}

handler.command = ['waifu','neko','foxgirl','husbando','quoteanime','fraseAnime','qanime','buscaranime','anime','anilist','personaje','character','animetop','recomanime']
export default handler
