import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
    // Format: teks|provider|jam|baterai
    if (!text) throw `*Contoh penggunaan:*\n${usedPrefix + command} teks|provider|jam|baterai\n\n*Contoh:* ${usedPrefix + command} halo|indosat|16:20|100`;
    
    const parts = text.split('|');
    if (parts.length < 4) throw 'Format salah! Gunakan: teks|provider|jam|baterai';
    
    const teks = parts[0].trim();
    const provider = parts[1].trim();
    const jam = parts[2].trim();
    const baterai = parts[3].trim();
    
    // Validasi
    if (!teks || !provider || !jam || !baterai) throw 'Semua field harus diisi!';
    if (!/^\d{1,2}:\d{2}$/.test(jam)) throw 'Format jam harus HH:MM (contoh: 16:20)';
    if (isNaN(baterai) || baterai < 0 || baterai > 100) throw 'Baterai harus angka 0-100';
    
    await m.reply(wait);
    
    try {
        const params = new URLSearchParams({
            text: teks,
            provider: provider,
            jam: jam,
            baterai: baterai
        });
        
        const apiUrl = `https://api.nexray.web.id/maker/v1/iqc?${params.toString()}`;
        const res = await fetch(apiUrl);
        
        // Cek apakah respons berupa gambar
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('image')) {
            const textResponse = await res.text();
            throw `API tidak mengembalikan gambar: ${textResponse.substring(0, 100)}`;
        }
        
        const buffer = await res.buffer();
        
        // Kirim dengan caption wm (sama seperti hd)
        await conn.sendFile(m.chat, buffer, 'iqc2.png', wm, m);
        
    } catch (error) {
        console.error(error);
        throw eror;
    }
};

handler.help = ['iqc2 <teks>|<provider>|<jam>|<baterai>'];
handler.tags = ['tools'];
handler.command = ['iqc2'];
handler.limit = 15;

export default handler;