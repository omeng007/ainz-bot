import axios from 'axios';
import FormData from 'form-data'; // Tambahan import untuk multipart/form-data
import uploadImage from '../lib/uploadImage.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Cek apakah ada gambar yang dikirim atau di-quote
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || q.mediaType || '';
        if (!/^image/.test(mime) || /webp/.test(mime)) {
            throw `Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim.`;
        }

        // Download gambar
        const img = await q.download();
        
        // Upload gambar (Tetap dipakai untuk API hd2, hd3, removebg)
        const out = await uploadImage(img); 
        await m.reply('⏳ *Memproses gambar...*');

        // Caption standar
        let caption = `🖼️ *${command.toUpperCase()} PROCESSOR*\n\n`;
        caption += `📸 *Gambar berhasil diproses*\n`;
        caption += `📅 *Diunduh:* ${new Date().toLocaleDateString('id-ID')}\n\n`;
        caption += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        let buffer;
        let fileName = 'processed.jpg';

        // Proses sesuai perintah
        if (command === 'hd') {
            // API Theresav HD (Menggunakan POST & FormData)
            const form = new FormData();
            // Memasukkan buffer gambar langsung ke form
            form.append('image', img, { filename: 'image.jpg', contentType: 'image/jpeg' });
            form.append('scale', '4');

            const api = await axios.post('https://api.theresav.eu/api/tools/hd', form, {
                headers: {
                    ...form.getHeaders(),
                    'x-apikey': 'sc7SW'
                },
                responseType: 'arraybuffer' // Karena response berupa gambar langsung
            });
            
            buffer = Buffer.from(api.data);
            fileName = 'hd.jpg';
            
        } else if (command === 'hd2') {
            // API botcahx remini-v2
            const api = await axios.get(`https://api.botcahx.eu.org/api/tools/remini-v2?url=${out}&apikey=${btc}`);
            if (!api.data?.url) throw new Error('Gagal memproses gambar');
            const imgRes = await axios.get(api.data.url, { responseType: 'arraybuffer' });
            buffer = Buffer.from(imgRes.data);
            fileName = 'hd2.jpg';
        } else if (command === 'hd3') {
            // API botcahx remini-v3
            const api = await axios.get(`https://api.botcahx.eu.org/api/tools/remini-v3?url=${out}&resolusi=4&apikey=${btc}`);
            if (!api.data?.url) throw new Error('Gagal memproses gambar');
            const imgRes = await axios.get(api.data.url, { responseType: 'arraybuffer' });
            buffer = Buffer.from(imgRes.data);
            fileName = 'hd3.jpg';
        } else if (command === 'removebg' || command === 'nobg') {
            // API NexRay removebg
            const api = await axios.get(`https://api.nexray.web.id/tools/removebg?url=${out}`, { responseType: 'arraybuffer' });
            buffer = Buffer.from(api.data);
            fileName = 'nobg.png';
        } else {
            throw 'Perintah tidak dikenali';
        }

        // Kirim hasil
        await conn.sendFile(m.chat, buffer, fileName, caption, m);

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `❌ *Gagal memproses gambar*\n\n${e.message || 'Terjadi kesalahan, coba lagi nanti.'}`, m);
    }
};

handler.help = ['hd', 'hd2', 'hd3', 'removebg', 'nobg'];
handler.tags = ['tools'];
handler.command = /^(hd|hd2|hd3|removebg|nobg)$/i;
handler.limit = true;
handler.premium = false;

export default handler;