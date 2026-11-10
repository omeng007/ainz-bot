import axios from 'axios';

const handler = async (m, { conn }) => {
  try {
    const response = await axios.get('https://api.nexray.web.id/information/gempa');
    const dataGempa = response.data.result;
    
    if (!dataGempa || !response.data.status) {
      throw new Error('Data gempa tidak tersedia');
    }
    
    const caption = `Waktu : ${dataGempa.Tanggal} ${dataGempa.Jam}\n` +
                  `Lintang : ${dataGempa.Lintang}\n` +
                  `Bujur : ${dataGempa.Bujur}\n` +
                  `Magnitude : ${dataGempa.Magnitude}\n` +
                  `Kedalaman : ${dataGempa.Kedalaman}\n` +
                  `Wilayah : ${dataGempa.Wilayah}\n` +
                  `Potensi : ${dataGempa.Potensi}\n` +
                  `Dirasakan : ${dataGempa.Dirasakan}`;
    
    conn.sendFile(m.chat, dataGempa.Shakemap, 'gempa.jpg', caption, m);
  } catch(e) {
    console.log(e);
    conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data gempa', m);
  }
};

handler.command = handler.help = ['infogempa', 'gempa'];
handler.tags = ['info'];
handler.premium = false;
handler.limit = true;

export default handler;