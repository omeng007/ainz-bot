import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    throw `Masukkan URL!\n\ncontoh:\n${usedPrefix}${command} https://pin.it/4CVodSq`;
  }
  if (!args[0].startsWith('https://')) {
    throw `Harus memasukkan URL yang valid dengan format *https://*\n\nEx: https://pin.it/4CVodSq`;
  }
  try {
    m.reply(wait);
    
    // Gunakan API NexRay
    const apiUrl = `https://api.nexray.web.id/downloader/pinterest?url=${encodeURIComponent(args[0])}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.result) {
      throw 'Gagal mengambil data dari Pinterest';
    }

    const result = json.result;
    let mediaUrl, mediaType, title;

    if (result.video) {
      mediaUrl = result.video;
      mediaType = 'video';
      title = result.title || 'Video Pinterest';
    } else if (result.image) {
      mediaUrl = result.image;
      mediaType = 'image';
      title = result.title || 'Gambar Pinterest';
    } else {
      throw 'Tidak ditemukan media yang dapat diunduh';
    }

    const author = result.author ? `By: ${result.author}\n` : '';

    const caption = `*${title}*\n${author}> © ʜᴀꜱʜɪʀᴀ - ᴀɪ • ʙʏ ᴀɪɴᴢ`;

    if (mediaType === 'video') {
      await conn.sendMessage(m.chat, { 
        video: { url: mediaUrl }, 
        caption: caption 
      }, { quoted: m });
    } else {
      await conn.sendFile(m.chat, mediaUrl, 'pinterest.jpg', caption, m);
    }

  } catch (e) {
    console.log(e);
    // Error handling seperti Spotify
    conn.reply(m.chat, eror, m);
  }
};

handler.help = ['pindl'];
handler.command = /^(pindl|pin)$/i;
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = false;

export default handler;