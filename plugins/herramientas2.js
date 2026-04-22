/**
 * HERRAMIENTAS PLUS - ITSUKI NAKANO
 * #getpic #say #ssweb #tourl #enhance #read #letra #google #ytsearch
 * #inactivos #gpname #gpdesc #gpbanner #link #revoke #admins #add
 * Z0RT SYSTEMS 🌸
 */

const sendTool = async (conn, m, text, isError = false) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(
        thumb,
        (isError ? '❌ ' : '🛠️ ') + (global.botName || 'Itsuki Nakano'),
        'Herramientas Plus'
    )
    return conn.sendMessage(m.chat, { text, contextInfo: ctx }, { quoted: m })
}

const normalizeJid = (jid) => jid?.split('@')[0]?.split(':')[0] + '@s.whatsapp.net'

const apiGet = async (url, timeout = 15000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, { signal:controller.signal, headers:{ 'User-Agent':'Mozilla/5.0', 'Accept':'application/json' } })
        if (!res.ok) throw new Error('HTTP '+res.status)
        return res.json()
    } finally { clearTimeout(timer) }
}

let handler = async (m, { conn, command, text, args, isAdmin, isOwner, isBotAdmin, db }) => {
    const cmd    = command.toLowerCase()
    const query  = (text || '').trim()
    const sender = normalizeJid(m.sender)
    const px     = global.prefix || '#'

    // ── GETPIC / PFP ──────────────────────────────────────────────────────────
    if (cmd === 'getpic' || cmd === 'pfp') {
        const target = m.quoted?.sender ? normalizeJid(m.quoted.sender) : m.mentionedJid?.[0] ? normalizeJid(m.mentionedJid[0]) : sender
        await m.react('📸')
        try {
            const ppUrl = await conn.profilePictureUrl(target, 'image')
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `📸 ${global.botName||'Itsuki Nakano'}`, 'Foto de Perfil')
            await conn.sendMessage(m.chat, {
                image: { url: ppUrl },
                caption: `📸 *FOTO DE PERFIL*\n\n👤 @${target.split('@')[0]}\n\n_Con cariño~ 🌸_`,
                mentions: [target],
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch {
            await m.react('❌')
            return sendTool(conn, m, `❌ No pude obtener la foto de perfil\n_El usuario puede tener privacidad activada~ 🌸_`, true)
        }
        return
    }

    // ── SAY ───────────────────────────────────────────────────────────────────
    if (cmd === 'say') {
        if (!query) return sendTool(conn, m, `🗣️ Uso: *${px}say <texto>*\n_Ejemplo: ${px}say Hola grupo!_ 🌸`)
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `🗣️ ${global.botName||'Itsuki Nakano'}`, 'Say')
        return conn.sendMessage(m.chat, { text: query, contextInfo: ctx }, { quoted: m })
    }

    // ── SSWEB ─────────────────────────────────────────────────────────────────
    if (cmd === 'ss' || cmd === 'ssweb') {
        if (!query || !query.startsWith('http')) return sendTool(conn, m,
            `🌐 Uso: *${px}ssweb <url>*\n_Ejemplo: ${px}ssweb https://google.com_ 🌸`
        )
        await m.react('📸')
        try {
            const ssUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(query)}&format=jpg&viewport_width=1280&viewport_height=720`
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `🌐 ${global.botName||'Itsuki Nakano'}`, 'Screenshot Web')
            await conn.sendMessage(m.chat, {
                image: { url: ssUrl },
                caption: `🌐 *SCREENSHOT*\n\n🔗 ${query}\n\n_Screenshot tomado~ 🌸_`,
                contextInfo: ctx
            }, { quoted: m })
            await m.react('✅')
        } catch {
            await m.react('❌')
            return sendTool(conn, m, `❌ No pude tomar el screenshot de *${query}*~ 🌸`, true)
        }
        return
    }

    // ── YTSEARCH / SEARCH ─────────────────────────────────────────────────────
    if (cmd === 'ytsearch' || cmd === 'search') {
        if (!query) return sendTool(conn, m, `🔍 Uso: *${px}ytsearch <búsqueda>*`)
        await m.react('🔍')
        try {
            const NEX_KEY = 'NEX-D0E7E64C8F5E44E98F00D6B4'
            const res = await fetch(`https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(query)}&apikey=${NEX_KEY}`, {
                headers: { 'x-api-key': NEX_KEY, 'Accept': 'application/json' }
            })
            const raw   = await res.text()
            const fixed = raw.replace(/\bverdadero\b/g,'true').replace(/\bfalso\b/g,'false').replace(/\bnulo\b/g,'null')
            const data  = JSON.parse(fixed)
            const resultados = (data?.result || []).slice(0, 5)
            if (!resultados.length) throw new Error('Sin resultados')
            let txt = `🔍 *RESULTADOS — ${query}*\n\n`
            resultados.forEach((v, i) => {
                txt += `${i+1}. *${v.title}*\n   ⏱️ ${v.duration} | 📺 ${v.channel}\n   🔗 ${v.link}\n\n`
            })
            txt += `_Usa *${px}play <link>* para descargar~ 🌸_`
            return sendTool(conn, m, txt)
        } catch {
            await m.react('❌')
            return sendTool(conn, m, `❌ No pude buscar *${query}*~ 🌸`, true)
        }
    }

    // ── LETRA / STYLE ─────────────────────────────────────────────────────────
    if (cmd === 'letra' || cmd === 'style') {
        if (!query) return sendTool(conn, m,
            `🔤 *ESTILOS DE LETRA*\n\nUso: *${px}letra <texto>*\n_Ejemplo: ${px}letra Hola mundo_ 🌸`
        )
        const estilos = {
            '𝗡𝗲𝗴𝗿𝗶𝘁𝗮': texto => [...texto].map(c => {
                const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                const bold = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
                const i = map.indexOf(c)
                return i >= 0 ? bold[i] : c
            }).join(''),
            '𝐶𝑢𝑟𝑠𝑖𝑣𝑎': texto => [...texto].map(c => {
                const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                const italic = '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧'
                const i = map.indexOf(c)
                return i >= 0 ? italic[i] : c
            }).join(''),
            '𝓒𝓪𝓵𝓲𝓰𝓻𝓪𝓯𝓲𝓪': texto => [...texto].map(c => {
                const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                const cal = '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃'
                const i = map.indexOf(c)
                return i >= 0 ? cal[i] : c
            }).join(''),
            'Ｔｅｘｔｏ　ａｎｃｈｏ': texto => [...texto].map(c => {
                const code = c.charCodeAt(0)
                if (code >= 33 && code <= 126) return String.fromCharCode(code + 65248)
                return c === ' ' ? '　' : c
            }).join(''),
            'ᴛᴇxᴛᴏ ᴘᴇǫᴜᴇñᴏ': texto => [...texto].toLowerCase().map(c => {
                const map = 'abcdefghijklmnopqrstuvwxyz'
                const small = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'
                const i = map.indexOf(c)
                return i >= 0 ? small[i] : c
            }).join('')
        }

        let resultado = `🔤 *ESTILOS PARA: "${query}"*\n\n`
        for (const [nombre, fn] of Object.entries(estilos)) {
            try { resultado += `*${nombre}:*\n${fn(query)}\n\n` } catch {}
        }
        return sendTool(conn, m, resultado)
    }

    // ── GOOGLE ────────────────────────────────────────────────────────────────
    if (cmd === 'google') {
        if (!query) return sendTool(conn, m, `🔍 Uso: *${px}google <búsqueda>*`)
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        return sendTool(conn, m,
            `🔍 *BÚSQUEDA EN GOOGLE*\n\n🔎 Query: *${query}*\n🔗 Link: ${url}\n\n_Abre el link para ver resultados~ 🌸_`
        )
    }

    // ── READ / READVIEWONCE ────────────────────────────────────────────────────
    if (cmd === 'read' || cmd === 'readviewonce') {
        const quoted = m.quoted
        if (!quoted) return sendTool(conn, m, `👁️ Responde a un mensaje de vista única con *${px}read*~ 🌸`)
        await m.react('👁️')
        try {
            const { downloadMediaMessage } = await import('@whiskeysockets/baileys')
            const buf  = await downloadMediaMessage(quoted, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
            const mime = quoted.msg?.mimetype || 'image/jpeg'
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `👁️ ${global.botName||'Itsuki Nakano'}`, 'Vista Única')
            if (/video/.test(mime)) {
                await conn.sendMessage(m.chat, { video:buf, mimetype:mime, caption:'👁️ *Mensaje de vista única desvelado~ 🌸*', contextInfo:ctx }, { quoted:m })
            } else {
                await conn.sendMessage(m.chat, { image:buf, caption:'👁️ *Mensaje de vista única desvelado~ 🌸*', contextInfo:ctx }, { quoted:m })
            }
            await m.react('✅')
        } catch {
            await m.react('❌')
            return sendTool(conn, m, `❌ No pude leer el mensaje de vista única~`, true)
        }
        return
    }

    // ── ADMINS (mencionar admins) ─────────────────────────────────────────────
    if (cmd === 'admins' || cmd === 'admin') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        const meta   = await conn.groupMetadata(m.chat)
        const admins = meta.participants.filter(p => p.admin).map(p => p.id)
        if (!admins.length) return sendTool(conn, m, `❌ No hay admins en este grupo~`)
        const txt    = `👮 *ADMINS DEL GRUPO*\n\n${admins.map(a=>`@${a.split('@')[0]}`).join('\n')}`
        const thumb  = await global.getBannerThumb()
        const ctx    = global.getNewsletterCtx(thumb,`👮 ${global.botName||'Itsuki Nakano'}`,'Admins')
        return conn.sendMessage(m.chat, { text:txt, mentions:admins, contextInfo:ctx }, { quoted:m })
    }

    // ── LINK (enlace del grupo) ───────────────────────────────────────────────
    if (cmd === 'link') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        if (!isBotAdmin) return sendTool(conn, m, `🤖 Necesito ser admin para obtener el link~`)
        try {
            const code = await conn.groupInviteCode(m.chat)
            return sendTool(conn, m,
                `🔗 *LINK DEL GRUPO*\n\nhttps://chat.whatsapp.com/${code}\n\n_¡Compártelo con cuidado~ 🌸_`
            )
        } catch { return sendTool(conn, m, `❌ No pude obtener el link~`, true) }
    }

    // ── REVOKE / RESTABLECER ──────────────────────────────────────────────────
    if (cmd === 'restablecer' || cmd === 'revoke') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        if (!isBotAdmin) return sendTool(conn, m, `🤖 Necesito ser admin~`)
        try {
            await conn.groupRevokeInvite(m.chat)
            const newCode = await conn.groupInviteCode(m.chat)
            return sendTool(conn, m,
                `✅ *ENLACE RESTABLECIDO*\n\n🔗 Nuevo link:\nhttps://chat.whatsapp.com/${newCode}\n\n_El enlace anterior ya no funciona~ 🌸_`
            )
        } catch { return sendTool(conn, m, `❌ No pude restablecer el enlace~`, true) }
    }

    // ── GPNAME ────────────────────────────────────────────────────────────────
    if (cmd === 'gpname' || cmd === 'groupname') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        if (!isBotAdmin) return sendTool(conn, m, `🤖 Necesito ser admin~`)
        if (!query) return sendTool(conn, m, `❌ Uso: *${px}gpname <nuevo nombre>*`)
        try {
            await conn.groupUpdateSubject(m.chat, query)
            return sendTool(conn, m, `✅ *Nombre del grupo cambiado a:* ${query} 🌸`)
        } catch { return sendTool(conn, m, `❌ No pude cambiar el nombre~`, true) }
    }

    // ── GPDESC ────────────────────────────────────────────────────────────────
    if (cmd === 'gpdesc' || cmd === 'groupdesc') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        if (!isBotAdmin) return sendTool(conn, m, `🤖 Necesito ser admin~`)
        if (!query) return sendTool(conn, m, `❌ Uso: *${px}gpdesc <descripción>*`)
        try {
            await conn.groupUpdateDescription(m.chat, query)
            return sendTool(conn, m, `✅ *Descripción del grupo actualizada~ 🌸*`)
        } catch { return sendTool(conn, m, `❌ No pude cambiar la descripción~`, true) }
    }

    // ── GPBANNER / GROUPIMG ───────────────────────────────────────────────────
    if (cmd === 'gpbanner' || cmd === 'groupimg') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        if (!isBotAdmin) return sendTool(conn, m, `🤖 Necesito ser admin~`)
        const quoted = m.quoted
        if (!quoted || !/(image)/.test(quoted.msg?.mimetype||'')) return sendTool(conn, m,
            `🖼️ Responde a una imagen con *${px}gpbanner* para cambiar la foto del grupo~ 🌸`
        )
        try {
            const { downloadMediaMessage } = await import('@whiskeysockets/baileys')
            const buf = await downloadMediaMessage(quoted, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
            await conn.updateProfilePicture(m.chat, buf)
            return sendTool(conn, m, `✅ *Foto del grupo actualizada~ 🌸*`)
        } catch { return sendTool(conn, m, `❌ No pude cambiar la foto~`, true) }
    }

    // ── INACTIVOS ─────────────────────────────────────────────────────────────
    if (cmd === 'inactivos' || cmd === 'kickinactivos') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        const kick = cmd === 'kickinactivos'
        if (kick && !isBotAdmin) return sendTool(conn, m, `🤖 Necesito ser admin para expulsar~`)
        const meta = await conn.groupMetadata(m.chat)
        const db_users = db?.users || {}
        const inactivos = meta.participants
            .filter(p => !p.admin && !db_users[normalizeJid(p.id)]?.lastSeen)
            .map(p => p.id)
        if (!inactivos.length) return sendTool(conn, m, `✅ No hay inactivos detectados~ 🌸`)
        const lista = inactivos.slice(0,20).map(j=>`@${j.split('@')[0]}`).join('\n')
        if (kick) {
            for (const j of inactivos.slice(0,10)) {
                try { await conn.groupParticipantsUpdate(m.chat, [j], 'remove'); await new Promise(r=>setTimeout(r,500)) } catch {}
            }
            return conn.sendMessage(m.chat, { text:`🚪 Se expulsaron *${Math.min(10,inactivos.length)}* usuarios inactivos~ 🌸`, mentions:inactivos.slice(0,10) }, { quoted:m })
        }
        return conn.sendMessage(m.chat, { text:`📊 *USUARIOS INACTIVOS (${inactivos.length})*\n\n${lista}\n\n_Usa *${px}kickinactivos* para expulsarlos~_`, mentions:inactivos.slice(0,20) }, { quoted:m })
    }

    // ── ADD ───────────────────────────────────────────────────────────────────
    if (cmd === 'add' || cmd === 'añadir' || cmd === 'agregar') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        if (!isBotAdmin) return sendTool(conn, m, `🤖 Necesito ser admin~`)
        const numero = query.replace(/[^0-9]/g,'')
        if (!numero) return sendTool(conn, m, `❌ Uso: *${px}add <número>*\n_Ejemplo: ${px}add 573001234567_`)
        try {
            const jid = numero + '@s.whatsapp.net'
            await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
            return sendTool(conn, m, `✅ *+${numero}* agregado al grupo~ 🌸`)
        } catch { return sendTool(conn, m, `❌ No pude agregar el número~\n_Verifica que sea correcto_ 🌸`, true) }
    }

    // ── DEL / DELETE (eliminar mensaje) ───────────────────────────────────────
    if (cmd === 'del' || cmd === 'delete') {
        const quoted = m.quoted
        if (!quoted) return sendTool(conn, m, `🗑️ Responde al mensaje que quieres eliminar~`)
        try {
            await conn.sendMessage(m.chat, { delete: quoted.key })
            await m.react('✅')
        } catch { return sendTool(conn, m, `❌ No pude eliminar el mensaje~`, true) }
        return
    }

    // ── GINFO / INFOGRUPO ─────────────────────────────────────────────────────
    if (cmd === 'gp' || cmd === 'infogrupo') {
        if (!m.isGroup) return sendTool(conn, m, `❌ Solo en grupos~`)
        const meta = await conn.groupMetadata(m.chat)
        const admins = meta.participants.filter(p=>p.admin).length
        const creado = new Date(meta.creation * 1000).toLocaleDateString('es-CO')
        return sendTool(conn, m,
            `📊 *INFO DEL GRUPO*\n\n` +
            `📝 Nombre: *${meta.subject}*\n` +
            `📅 Creado: *${creado}*\n` +
            `👥 Miembros: *${meta.participants.length}*\n` +
            `👮 Admins: *${admins}*\n` +
            `📖 Descripción: ${meta.desc||'Sin descripción'}\n\n` +
            `_Estadísticas del grupo~ 🌸_`
        )
    }
}

handler.command = ['getpic','pfp','say','ss','ssweb','ytsearch','search','letra','style','google','read','readviewonce','admins','admin','link','restablecer','revoke','gpname','groupname','gpdesc','groupdesc','gpbanner','groupimg','inactivos','kickinactivos','add','añadir','agregar','del','delete','gp','infogrupo']
handler.group   = false
export default handler
