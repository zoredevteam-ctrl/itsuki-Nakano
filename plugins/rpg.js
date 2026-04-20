/**
 * RPG - ITSUKI NAKANO
 * #clases #elegirclase #perfil #dungeon #atacar #curar #inventario #pelear #rpgtop
 * Z0RT SYSTEMS 🌸
 */

const sendRPG = async (conn, m, text, mentions = []) => {
    const thumb = await global.getBannerThumb()
    const ctx   = global.getNewsletterCtx(thumb, `⚔️ ${global.botName||'Itsuki Nakano'}`, 'Sistema RPG')
    return conn.sendMessage(m.chat, { text, mentions, contextInfo: ctx }, { quoted: m })
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const CLASES = {
    guerrero:  { nombre:'⚔️ Guerrero',  hp:120, atk:20, def:15, sp:'Golpe Poderoso',  costo:0 },
    mago:      { nombre:'🔮 Mago',      hp:80,  atk:30, def:8,  sp:'Bola de Fuego',   costo:0 },
    arquero:   { nombre:'🏹 Arquero',   hp:100, atk:25, def:10, sp:'Flecha Precisa',  costo:0 },
    sanador:   { nombre:'🌸 Sanador',   hp:90,  atk:15, def:12, sp:'Curación Mayor',  costo:0 },
    asesino:   { nombre:'🗡️ Asesino',   hp:85,  atk:35, def:6,  sp:'Golpe Crítico',   costo:0 }
}

const ENEMIGOS = [
    { nombre:'🐺 Lobo Oscuro',    hp:60,  atk:12, def:5,  exp:30,  oro:20  },
    { nombre:'🐉 Dragón Menor',   hp:120, atk:22, def:12, exp:80,  oro:60  },
    { nombre:'💀 Esqueleto',      hp:40,  atk:10, def:3,  exp:20,  oro:10  },
    { nombre:'🧟 Zombi',          hp:70,  atk:15, def:7,  exp:40,  oro:30  },
    { nombre:'🦂 Escorpión Gigante', hp:50, atk:18, def:4, exp:35, oro:25 },
    { nombre:'👹 Ogro',          hp:150, atk:28, def:18, exp:120, oro:100 },
    { nombre:'🧙 Mago Oscuro',   hp:90,  atk:30, def:6,  exp:90,  oro:70  }
]

const ensureRPG = (db, jid) => {
    if (!db.users)      db.users = {}
    if (!db.users[jid]) db.users[jid] = {}
    const u = db.users[jid]
    if (!u.rpg) u.rpg = { clase:null, hp:100, maxHp:100, atk:15, def:10, exp:0, nivel:1, oro:0, inventario:[], enDungeon:false, enemigo:null }
    return u.rpg
}

const dungeonActiva = new Map()

let handler = async (m, { conn, command, text, args, db }) => {
    const cmd    = command.toLowerCase()
    const sender = (m.sender||'').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/,'').split('@')[0]+'@s.whatsapp.net'
    const rpg    = ensureRPG(db, sender)
    const name   = m.pushName || sender.split('@')[0]
    const px     = global.prefix || '#'

    // ── CLASES ────────────────────────────────────────────────────────────────
    if (cmd === 'clases') {
        const lista = Object.entries(CLASES).map(([k, c]) =>
            `${c.nombre}\n   ❤️ HP: ${c.hp} | ⚔️ ATK: ${c.atk} | 🛡️ DEF: ${c.def}\n   ✨ Especial: ${c.sp}`
        ).join('\n\n')
        return sendRPG(conn, m,
            `📋 *CLASES DISPONIBLES*\n\n${lista}\n\n_Usa *${px}elegirclase <nombre>* para elegir~ 🌸_`
        )
    }

    // ── ELEGIRCLASE ───────────────────────────────────────────────────────────
    if (cmd === 'elegirclase') {
        const claseKey = (text||'').trim().toLowerCase()
        if (!claseKey || !CLASES[claseKey]) return sendRPG(conn, m,
            `❌ Clase inválida.\n_Clases: ${Object.keys(CLASES).join(', ')}_\n_Uso: ${px}elegirclase guerrero_`
        )
        if (rpg.clase) return sendRPG(conn, m, `⚠️ Ya tienes la clase *${rpg.clase}*\n_¡Úsala bien~ 🌸_`)
        const c = CLASES[claseKey]
        rpg.clase = claseKey; rpg.hp = c.hp; rpg.maxHp = c.hp; rpg.atk = c.atk; rpg.def = c.def
        return sendRPG(conn, m,
            `⚔️ *¡CLASE ELEGIDA!*\n\n` +
            `${c.nombre} desbloqueada para *${name}* 🎉\n\n` +
            `❤️ HP: *${c.hp}*\n⚔️ ATK: *${c.atk}*\n🛡️ DEF: *${c.def}*\n✨ Especial: *${c.sp}*\n\n` +
            `_¡Ahora ve al dungeon con ${px}dungeon~ 🌸_`
        )
    }

    // ── PERFIL RPG ────────────────────────────────────────────────────────────
    if (cmd === 'rpgperfil' || cmd === 'miperfil') {
        if (!rpg.clase) return sendRPG(conn, m, `❌ No tienes clase. Usa *${px}elegirclase* primero~ 🌸`)
        const c    = CLASES[rpg.clase]
        const barra = Math.round((rpg.hp / rpg.maxHp) * 10)
        const hpBar = '█'.repeat(barra) + '░'.repeat(10 - barra)
        return sendRPG(conn, m,
            `⚔️ *PERFIL RPG — ${name}*\n\n` +
            `${c.nombre}\n\n` +
            `❤️ HP: [${hpBar}] ${rpg.hp}/${rpg.maxHp}\n` +
            `⚔️ ATK: *${rpg.atk}*\n🛡️ DEF: *${rpg.def}*\n` +
            `✨ EXP: *${rpg.exp}*\n⭐ Nivel: *${rpg.nivel}*\n💰 Oro: *${rpg.oro}*\n\n` +
            `✨ Especial: *${c.sp}*\n\n` +
            `_¡Sigue entrenando~ 🌸_`
        )
    }

    // ── DUNGEON ───────────────────────────────────────────────────────────────
    if (cmd === 'dungeon') {
        if (!rpg.clase) return sendRPG(conn, m, `❌ Elige una clase primero con *${px}elegirclase*~ 🌸`)
        if (rpg.hp <= 0) return sendRPG(conn, m, `💔 Estás derrotado. Usa *${px}curar* primero~ 🌸`)
        if (dungeonActiva.has(sender)) return sendRPG(conn, m, `⚔️ Ya estás en combate. Usa *${px}atacar* o *${px}habilidad*~ 🌸`)

        const enemigo = { ...ENEMIGOS[randInt(0, ENEMIGOS.length - 1)] }
        dungeonActiva.set(sender, enemigo)

        const hpBar = (hp, max) => { const b=Math.round((hp/max)*10); return '█'.repeat(b)+'░'.repeat(10-b) }
        return sendRPG(conn, m,
            `⚔️ *¡COMBATE INICIADO!*\n\n` +
            `*${name}* vs *${enemigo.nombre}*\n\n` +
            `👤 Tu HP: [${hpBar(rpg.hp,rpg.maxHp)}] ${rpg.hp}/${rpg.maxHp}\n` +
            `👹 Enemigo HP: [${hpBar(enemigo.hp,enemigo.hp)}] ${enemigo.hp}/${enemigo.hp}\n\n` +
            `_Usa *${px}atacar* o *${px}habilidad*~ 🌸_`
        )
    }

    // ── ATACAR / HABILIDAD ────────────────────────────────────────────────────
    if (cmd === 'atacar' || cmd === 'habilidad') {
        if (!rpg.clase) return sendRPG(conn, m, `❌ Elige una clase primero~ 🌸`)
        const enemigo = dungeonActiva.get(sender)
        if (!enemigo) return sendRPG(conn, m, `❌ No estás en combate. Usa *${px}dungeon*~ 🌸`)

        const isHabilidad = cmd === 'habilidad'
        const c  = CLASES[rpg.clase]
        let dano = randInt(rpg.atk - 5, rpg.atk + 5)
        if (isHabilidad) dano = Math.floor(dano * 1.8) // Habilidad hace más daño

        dano         = Math.max(1, dano - Math.floor(enemigo.def * 0.5))
        enemigo.hp   = Math.max(0, enemigo.hp - dano)

        let txt = `⚔️ ${isHabilidad?`*${c.sp}*`:'Atacas'} a *${enemigo.nombre}*!\n💥 Daño: *${dano}*\n`

        if (enemigo.hp <= 0) {
            dungeonActiva.delete(sender)
            rpg.exp += enemigo.exp; rpg.oro += enemigo.oro
            // Level up cada 100 exp
            const nuevosNiveles = Math.floor(rpg.exp / 100) - (rpg.nivel - 1)
            if (nuevosNiveles > 0) { rpg.nivel += nuevosNiveles; rpg.maxHp += nuevosNiveles * 10; rpg.atk += nuevosNiveles * 2; rpg.def += nuevosNiveles * 1 }
            return sendRPG(conn, m,
                `⚔️ *¡VICTORIA!*\n\n` +
                `*${enemigo.nombre}* fue derrotado! 🎉\n\n` +
                `✨ *+${enemigo.exp} EXP*\n💰 *+${enemigo.oro} Oro*\n` +
                `${nuevosNiveles>0?`⭐ *¡SUBISTE AL NIVEL ${rpg.nivel}!*\n`:''}` +
                `\n_¡Usa *${px}dungeon* para otro combate~ 🌸_`
            )
        }

        // Contraataque
        const danoEnemigo = Math.max(1, randInt(enemigo.atk-3, enemigo.atk+3) - Math.floor(rpg.def*0.5))
        rpg.hp = Math.max(0, rpg.hp - danoEnemigo)
        txt += `\n👹 *${enemigo.nombre}* contraataca: *${danoEnemigo}* daño\n`

        const hpBar = (hp, max) => { const b=Math.round((hp/max)*10); return '█'.repeat(b)+'░'.repeat(10-b) }
        txt += `\n👤 Tu HP: [${hpBar(rpg.hp,rpg.maxHp)}] ${rpg.hp}/${rpg.maxHp}\n`
        txt += `👹 HP enemigo: [${hpBar(enemigo.hp,enemigo.hp+dano)}] ${enemigo.hp}\n`

        if (rpg.hp <= 0) {
            dungeonActiva.delete(sender)
            txt += `\n💀 *¡FUISTE DERROTADO!*\nUsa *${px}curar* para recuperarte~ 🌸`
        } else {
            txt += `\n_Usa *${px}atacar* para continuar~ 🌸_`
        }
        return sendRPG(conn, m, txt)
    }

    // ── CURAR ─────────────────────────────────────────────────────────────────
    if (cmd === 'curar' || cmd === 'heal') {
        if (!rpg.clase) return sendRPG(conn, m, `❌ Elige una clase primero~ 🌸`)
        if (rpg.hp >= rpg.maxHp) return sendRPG(conn, m, `✅ Ya tienes el HP completo~ 🌸`)
        const costo = 30
        if ((db.users[sender]?.money||0) < costo) return sendRPG(conn, m,
            `❌ Necesitas *${costo} Flores* para curarte\n💰 Tienes: *${db.users[sender]?.money||0}*`
        )
        db.users[sender].money = (db.users[sender].money||0) - costo
        const curado = Math.floor(rpg.maxHp * 0.5)
        rpg.hp = Math.min(rpg.maxHp, rpg.hp + curado)
        return sendRPG(conn, m,
            `💊 *¡CURADO!*\n\n❤️ +${curado} HP\n❤️ HP actual: *${rpg.hp}/${rpg.maxHp}*\n💰 Costo: *${costo} Flores*\n\n_¡Listo para combatir~ 🌸_`
        )
    }

    // ── RPG TOP ───────────────────────────────────────────────────────────────
    if (cmd === 'rpgtop') {
        const all = Object.entries(db.users||{})
            .filter(([,u]) => u.rpg?.nivel >= 1 && u.rpg?.clase)
            .map(([jid,u]) => ({ jid, nivel:u.rpg.nivel, exp:u.rpg.exp }))
            .sort((a,b) => b.nivel!==a.nivel ? b.nivel-a.nivel : b.exp-a.exp)
            .slice(0,10)
        if (!all.length) return sendRPG(conn, m, `📊 Nadie ha jugado RPG aún~ 🌸`)
        const med=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']
        let txt = `⚔️ *TOP 10 RPG* 🏆\n\n`
        all.forEach((p,i) => { txt += `${med[i]} @${p.jid.split('@')[0]} → Nv.*${p.nivel}* (${p.exp} EXP)\n` })
        return sendRPG(conn, m, txt, all.map(p=>p.jid))
    }
}

handler.command = ['clases','elegirclase','rpgperfil','miperfil','dungeon','atacar','habilidad','curar','heal','rpgtop']
export default handler
