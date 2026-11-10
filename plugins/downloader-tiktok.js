import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `✨ *Contoh penggunaan:* ${usedPrefix}${command} https://vt.tiktok.com/xxxxx/`;
    if (!text.match(/tiktok/gi)) throw '❌ URL harus dari TikTok!';
    
    try {
        await m.reply('🎬 *Mengunduh konten TikTok...*');
        
        const apiUrl = `https://api.nexray.eu.cc/downloader/tiktok?url=${encodeURIComponent(text)}`;
        const res = await axios.get(apiUrl);
        
        if (!res.data.status || !res.data.result) {
            throw '❌ Gagal mengunduh konten atau konten tidak ditemukan';
        }

        const data = res.data.result;
        const isPhotoMode = data.duration === "0 seconds" && Array.isArray(data.data);
        
        // Format tanggal dari taken_at
        let createTime = data.taken_at || 'Tidak diketahui';
        if (createTime.match(/\d{2}\/\d{2}\/\d{4}/)) {
            const [datePart, timePart] = createTime.split(' ');
            const [month, day, year] = datePart.split('/');
            createTime = `${day}/${month}/${year} ${timePart || ''}`;
        }
        
        // Buat caption lengkap (tanpa ukuran file)
        let caption = '';
        caption += `📹 *TIKTOK ${isPhotoMode ? 'PHOTOS' : 'VIDEO'}*\n\n`;
        caption += `📌 *Judul:* ${data.title ? (data.title.length > 200 ? data.title.substring(0, 200) + '...' : data.title) : 'Tidak ada judul'}\n`;
        caption += `👤 *Pembuat:* ${data.author?.nickname || data.author?.fullname || 'Tidak diketahui'}\n`;
        caption += `📅 *Dibuat:* ${createTime}\n`;
        if (!isPhotoMode) {
            caption += `🌐 *Region:* ${data.region || 'Tidak diketahui'}\n`;
            caption += `⏱️ *Durasi:* ${data.duration || 'Tidak diketahui'}\n`;
        }
        caption += `\n`;
        
        caption += `📊 *Statistik:*\n`;
        if (data.stats) {
            caption += `   👁️ *Ditonton:* ${data.stats.views || '0'}\n`;
            caption += `   ❤️ *Suka:* ${data.stats.likes || '0'}\n`;
            caption += `   💬 *Komentar:* ${data.stats.comment || '0'}\n`;
            caption += `   🔄 *Dibagikan:* ${data.stats.share || '0'}\n`;
            if (data.stats.save) caption += `   💾 *Disimpan:* ${data.stats.save || '0'}\n`;
            if (data.stats.download) caption += `   📥 *Download:* ${data.stats.download || '0'}\n`;
        }
        caption += `\n`;
        
        if (data.music_info?.title) {
            caption += `🎵 *Musik:*\n`;
            caption += `   • *Judul:* ${data.music_info.title}\n`;
            if (data.music_info.author) {
                caption += `   • *Artis:* ${data.music_info.author}\n`;
            }
            if (data.music_info.original === 'Yes') {
                caption += `   • *Original:* ✅\n`;
            }
            caption += `   • *Durasi:* ${data.music_info.duration || 'Tidak diketahui'}\n`;
        }
        
        caption += `\n📅 *Diunduh:* ${new Date().toLocaleDateString('id-ID')}\n\n`;
        caption += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

        // Deteksi tipe konten
        if (isPhotoMode) {
            // Ini adalah slideshow gambar
            const images = data.data;
            const totalImages = images.length;
            
            if (totalImages === 1) {
                // Single image
                await conn.sendFile(m.chat, images[0], 'tiktok.jpg', caption, m);
            } else {
                // Multiple images
                await m.reply(`📸 *Ditemukan ${totalImages} gambar...*`);
                
                for (let i = 0; i < totalImages; i++) {
                    const imgCaption = i === 0 ? caption : `📸 *TIKTOK PHOTOS*\n\n🖼️ Gambar ${i + 1}/${totalImages}\n\n> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;
                    await conn.sendFile(m.chat, images[i], `tiktok_${i+1}.jpg`, imgCaption, m);
                    
                    // Delay antar gambar
                    if (i < totalImages - 1) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            
        } else {
            // Ini adalah video - ambil video tanpa watermark dari data.data
            if (typeof data.data === 'string') {
                await conn.sendFile(m.chat, data.data, 'tiktok_nowm.mp4', caption, m);
            } else {
                throw '❌ Format video tidak valid';
            }
        }

        // Kirim audio musik terpisah jika ada
        if (data.music_info?.url) {
            try {
                await conn.sendMessage(m.chat, { 
                    audio: { url: data.music_info.url }, 
                    mimetype: 'audio/mpeg',
                    fileName: 'tiktok_audio.mp3',
                    caption: `🎵 *Audio TikTok*\n\n` +
                           `*Judul:* ${data.music_info.title || 'Audio TikTok'}\n` +
                           `*Artis:* ${data.music_info.author || 'Tidak diketahui'}\n` +
                           `*Durasi:* ${data.music_info.duration || 'Tidak diketahui'}\n` +
                           `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`
                }, { quoted: m });
            } catch (audioError) {
                console.log('Gagal mengirim audio:', audioError.message);
            }
        }

    } catch (e) {
        console.error('Error:', e);
        conn.reply(m.chat, `❌ *Gagal mengunduh konten TikTok*\n\n${e.message || 'Pastikan URL valid dan coba lagi!'}`, m);
    }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = /^(tiktok|tt|tiktokdl|tiktoknowm)$/i;
handler.limit = true;
handler.premium = false;

export default handler;