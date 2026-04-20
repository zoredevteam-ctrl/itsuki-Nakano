// ── SISTEMA DE HUMOR DE ITSUKI SEGÚN LA HORA ─────────────────────────────────
// Importa esto en cada plugin: import { getMood, sendItsuki } from './itsuki_mood.js'

export const getMood = () => {
    const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })).getHours()
    if (h >= 5  && h < 12) return 'manana'   // Estudiosa y motivada
    if (h >= 12 && h < 18) return 'tarde'    // Hambrienta y distraída
    if (h >= 18 && h < 22) return 'noche'    // Cansada y soñolienta
    return 'madrugada'                        // Molesta porque la despertaron
}

export const moodEmoji = {
    manana:    '📚',
    tarde:     '🍱',
    noche:     '😴',
    madrugada: '😤'
}

export const greet = (nombre) => {
    const mood = getMood()
    const greets = {
        manana:    `📚 ¡Buenos días, ${nombre}! Hoy vamos a ser muy productivos~ ¡Yo ya estudié 3 capítulos! 🌿`,
        tarde:     `🍱 Hola ${nombre}... ¿tú también tienes hambre? Porque yo sí... mucha... 😋🍀`,
        noche:     `😴 Hola ${nombre}... ya es tarde... tengo mucho sueño... pero aquí estoy 🍀`,
        madrugada: `😤 ¿A estas horas? En serio ${nombre}... estaba durmiendo... ugh... 🍀`
    }
    return greets[mood]
}

export const wait = () => {
    const mood = getMood()
    const msgs = {
        manana:    '📚 ¡Dame un momento! Estoy calculando todo con precisión~',
        tarde:     '🍱 Espera... estaba pensando en el almuerzo... ya voy~',
        noche:     '😴 Un segundo... estoy muy cansada pero ya lo hago...',
        madrugada: '😤 Bien, bien... dame un momento... aunque me hayas despertado...'
    }
    return msgs[mood]
}

export const success = () => {
    const mood = getMood()
    const msgs = {
        manana:    '📚 ¡Listo! Perfecto como mis apuntes de historia~ ✨',
        tarde:     '🍱 ¡Hecho! Oye... ¿después de esto pedimos algo de comer? 😋',
        noche:     '😴 Ya está... ¿ya puedo dormir? 🌙',
        madrugada: '😤 Listo. Ahora déjame dormir por favor...'
    }
    return msgs[mood]
}

export const error = () => {
    const mood = getMood()
    const msgs = {
        manana:    '📚 Oh no... algo salió mal. Pero no importa, ¡lo intentamos de nuevo! 💪🍀',
        tarde:     '🍱 Ugh... error. Igual que cuando quemo el arroz... 😔',
        noche:     '😴 Error... qué mala suerte... y yo tan cansada...',
        madrugada: '😤 Error. Claro. A las 3am. Todo perfecto.'
    }
    return msgs[mood]
}

export const ownerOnly = () => {
    const mood = getMood()
    const msgs = {
        manana:    '📚 ¡Solo Aarom puede usar esto! Así está en mis notas~ 🍀',
        tarde:     '🍱 Eso es solo para Aarom... como mi lonchera, no se toca 😤',
        noche:     '😴 Solo... Aarom... puede... zzz... digo, solo él puede~',
        madrugada: '😤 Es de Aarom. No tuyo. Déjame dormir.'
    }
    return msgs[mood]
}

export const adminOnly = () => {
    const mood = getMood()
    const msgs = {
        manana:    '📚 ¡Solo los admins pueden usar esto! Es la regla~ 🍀',
        tarde:     '🍱 Eso es para admins... como la mesa reservada del comedor 😅',
        noche:     '😴 Admins... solo admins... buenas noches~',
        madrugada: '😤 Solo admins. A dormir.'
    }
    return msgs[mood]
}

export const noGroup = () => {
    const mood = getMood()
    const msgs = {
        manana:    '📚 ¡Este comando es solo para grupos! Apúntalo~ 🍀',
        tarde:     '🍱 Solo en grupos... como el almuerzo compartido 😅',
        noche:     '😴 Solo en grupos... buenas noches~',
        madrugada: '😤 Grupos. Solo. Ahora duermo.'
    }
    return msgs[mood]
}

export const cooldown = (min) => {
    const mood = getMood()
    const msgs = {
        manana:    `📚 ¡Paciencia! Debes esperar *${min} minuto${min!==1?'s':''}* más~ 🍀`,
        tarde:     `🍱 Espera *${min} minuto${min!==1?'s':''}*... igual que esperando el almuerzo 😅`,
        noche:     `😴 *${min} minuto${min!==1?'s':''}* más... yo también espero el sueño~`,
        madrugada: `😤 *${min} minuto${min!==1?'s':''}*. Y yo aquí despierta. Perfecto.`
    }
    return msgs[mood]
}