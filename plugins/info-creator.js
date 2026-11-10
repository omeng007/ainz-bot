var name = global.nameowner || 'Owner';
var numberowner = global.numberowner || '0';
var gmail = global.mail || 'owner@example.com';
var instagram = global.instagram || 'https://instagram.com/owner';

var handler = async (m, { conn }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:${name};;;
FN:${name}
ORG:Creator Bot
TITLE:Owner
item1.TEL;waid=${numberowner}:${numberowner}
item1.X-ABLabel:📞 WhatsApp
item2.EMAIL;type=INTERNET:${gmail}
item2.X-ABLabel:✉️ Email
item3.URL:${instagram}
item3.X-ABLabel:📷 Instagram
item4.ADR:;;🇮🇩 Indonesia;;;;
item4.X-ABLabel:📍 Lokasi
END:VCARD`

    const sentMsg = await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: name,
                contacts: [{ vcard }]
            }
        }
    )

    const text = `🌟 *INFORMASI OWNER BOT* 🌟\n\n` +
        `👤 *Nama:* ${name}\n` +
        `📞 *WhatsApp:* wa.me/${numberowner}\n` +
        `✉️ *Email:* ${gmail}\n` +
        `📷 *Instagram:* ${instagram}\n` +
        `📍 *Lokasi:* Indonesia\n\n` +
        `✨ *Jangan ragu untuk menghubungi jika ada pertanyaan atau kerjasama!* ✨`

    await conn.reply(m.chat, text, sentMsg)
}

handler.command = handler.help = ['owner', 'creator'];
handler.tags = ['info'];
handler.limit = false;

export default handler;