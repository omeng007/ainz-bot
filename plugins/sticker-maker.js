import fs from 'fs';
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Ambil teks dari pesan atau quoted
    text = text 
        ? text 
        : m.quoted && m.quoted.text 
        ? m.quoted.text 
        : m.quoted && m.quoted.caption 
        ? m.quoted.caption 
        : m.quoted && m.quoted.description 
        ? m.quoted.description 
        : '';
        
    if (!text) throw `✨ *Contoh penggunaan:* ${usedPrefix + command} Lagi Ruwet`;

    // Kirim pesan menunggu
    await conn.reply(m.chat, '⏳ *Membuat sticker...*', m);

    // Tentukan URL API berdasarkan perintah
    let apiUrl;
    const baseUrl = 'https://api.nexray.web.id/maker/';
    const textEncoded = encodeURIComponent(text.substring(0, 151));

    switch (command) {
        case 'brat':
            apiUrl = `${baseUrl}brat?text=${textEncoded}`;
            break;
        case 'brathd':
            apiUrl = `${baseUrl}brathd?text=${textEncoded}`;
            break;
        case 'brat2':
        case 'bratgif':
        case 'bratvid':
            apiUrl = `${baseUrl}bratvid?text=${textEncoded}`;
            break;
        case 'bratanime':
            apiUrl = `${baseUrl}bratanime?text=${textEncoded}`;
            break;
        case 'ttp':
            apiUrl = `${baseUrl}ttp?text=${textEncoded}`;
            break;
        case 'attp':
            // attp menggunakan API botcahx karena tidak tersedia di nexray
            apiUrl = `https://api.botcahx.eu.org/api/maker/attp?text=${textEncoded}&apikey=${btc}`;
            break;
        default:
            throw 'Perintah tidak dikenali';
    }

    const err = fs.readFileSync(`./media/sticker/emror.webp`);

    try {
        // Download dari API
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(response.data);

        // Kirim sticker sesuai tipe
        if (command === 'attp') {
            await conn.sendFile(m.chat, buffer, 'sticker.webp', '', m);
        } else if (command === 'brat2' || command === 'bratgif' || command === 'bratvid') {
            await conn.sendVideoAsSticker(m.chat, buffer, m, { packname: global.packname, author: global.author });
        } else {
            await conn.sendImageAsSticker(m.chat, buffer, m, { packname: global.packname, author: global.author });
        }
    } catch (e) {
        console.error(e);
        await conn.sendImageAsSticker(m.chat, err, m, { packname: global.packname, author: global.author });
        conn.reply(m.chat, `❌ *Gagal membuat sticker*\n\n${e.message || 'Terjadi kesalahan'}`, m);
    }
};

handler.help = ['brat', 'brathd', 'brat2', 'bratgif', 'bratvid', 'bratanime', 'ttp', 'attp'];
handler.tags = ['sticker'];
handler.command = /^(brat|brathd|brat2|bratgif|bratvid|bratanime|ttp|attp)$/i;
handler.limit = true;

export default handler;