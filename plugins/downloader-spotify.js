import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `❓ *Contoh:*\n${usedPrefix}spotify https://open.spotify.com/track/...\n${usedPrefix}spotify lagu favorit`;

  const wait = '⏳ *Memproses...*';
  await m.reply(wait);

  // URL Spotify
  if (args[0].match(/open\.spotify\.com\/(track|playlist|album)/i)) {
    try {
      const encoded = encodeURIComponent(args[0]);
      const api = await fetch(`https://api.nexray.eu.cc/downloader/spotify?url=${encoded}`);
      const json = await api.json();

      if (!json.status || !json.result?.url) throw 'Gagal mendapatkan URL download';

      const { title, artist, url, thumbnail } = json.result; // coba ambil thumbnail jika ada
      
      // Gunakan judul asli untuk caption
      let titleText = title || 'Tidak diketahui';
      let artistText = artist || 'Tidak diketahui';
      
      // Thumbnail: pakai dari API jika ada, fallback default Spotify
      let thumbUrl = thumbnail || 'https://www.scdn.co/i/_global/open-graph-default.png';

      // Buat caption teks lengkap
      let caption = `🎵 *SPOTIFY DOWNLOADER*\n\n`;
      caption += `📌 *Judul:* ${titleText}\n`;
      caption += `🎤 *Artis:* ${artistText}\n`;
      caption += `🔗 *URL:* ${args[0]}\n\n`;
      caption += `📦 *Format:* MP3\n\n`;
      caption += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

      // Kirim gambar + caption (teks biasa)
      await conn.sendMessage(m.chat, {
        image: { url: thumbUrl },
        caption: caption,
        mentions: [m.sender]
      }, { quoted: m });

      // Kirim audio (tanpa externalAdReply)
      await conn.sendMessage(m.chat, {
        audio: { url: url },
        mimetype: 'audio/mpeg',
        fileName: `${titleText} - ${artistText}.mp3`.replace(/[<>:"/\\|?*]/g, '')
      }, { quoted: m });

    } catch (e) {
      throw `❌ *Download gagal:* ${e.message || 'Coba lagi'}`;
    }
  } 
  // Search
  else {
    try {
      const query = encodeURIComponent(args.join(' '));
      const api = await fetch(`https://api.nexray.web.id/search/spotify?q=${query}`);
      const json = await api.json();

      if (!json.status || !json.result?.length) throw 'Tidak ada hasil ditemukan';

      let teks = `🔍 *SPOTIFY SEARCH*\n\n`;
      teks += `📌 *Kata kunci:* "${args.join(' ')}"\n`;
      teks += `📊 *Hasil:* ${json.result.length} ditemukan\n\n`;

      json.result.slice(0, 5).forEach((track, i) => {
        teks += `*${i + 1}.* *${track.title}*\n`;
        teks += `   🎤 ${track.artist}\n`;
        teks += `   ⏱️ ${track.duration}\n`;
        teks += `   🔗 ${track.url}\n\n`;
      });

      if (json.result.length > 5) {
        teks += `...dan ${json.result.length - 5} hasil lainnya\n\n`;
      }

      teks += `📝 *Cara download:*\n${usedPrefix}spotify <link di atas>\n\n`;
      teks += `> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

      // Untuk search, tetap kirim teks biasa (tanpa gambar)
      m.reply(teks);

    } catch (e) {
      throw `❌ *Pencarian gagal:* ${e.message || 'Coba kata kunci lain'}`;
    }
  }
};

handler.help = ['spotify <url/query>'];
handler.tags = ['downloader'];
handler.command = /^(spotify|spoti)$/i;
handler.limit = true;

export default handler;