import axios from 'axios';
import { setInterval } from 'timers';

let lastGempaData = null;

async function getGempaInfo() {
    try {
        const url = `https://api.nexray.eu.cc/information/gempa`;
        const response = await axios.get(url);

        if (!response.data.status || !response.data.result) {
            console.log('Data gempa tidak tersedia atau API error');
            return;
        }

        const res = response.data.result;

        if (lastGempaData && lastGempaData.datetime === res.DateTime) {
            console.log('Data gempa belum berubah, tidak ada pengingat.');
            return;
        }

        lastGempaData = {
            datetime: res.DateTime,
            ...res
        };

        const gempaInfo = {
            waktu: `${res.Tanggal} ${res.Jam}`,
            lintang: res.Lintang,
            bujur: res.Bujur,
            magnitude: res.Magnitude,
            kedalaman: res.Kedalaman,
            wilayah: res.Wilayah,
            potensi: res.Potensi,
            gambar: res.Shakemap,
            dirasakan: res.Dirasakan || '-'
        };

        console.log(`
        Waktu Gempa: ${gempaInfo.waktu}
        Magnitudo: ${gempaInfo.magnitude}
        Wilayah: ${gempaInfo.wilayah}
        Potensi: ${gempaInfo.potensi}
        Dirasakan: ${gempaInfo.dirasa}
        Gambar: ${gempaInfo.gambar}
        `);

        sendGempaReminderToGroups(gempaInfo);
    } catch (error) {
        console.error('[❗] Terjadi kesalahan saat mengambil data gempa:', error);
    }
}

async function sendGempaReminderToGroups(gempaInfo) {
    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (chat.notifgempa) {
            const reminderMessage = `🚨 *PENGINGAT GEMPA BUMI* 🚨\n\n🕒 Waktu: ${gempaInfo.waktu}\n🌍 Wilayah: ${gempaInfo.wilayah}\n💥 Magnitudo: ${gempaInfo.magnitude}\n🌐 Lintang: ${gempaInfo.lintang}\n🌐 Bujur: ${gempaInfo.bujur}\n🔍 Kedalaman: ${gempaInfo.kedalaman}\n🌊 Potensi: ${gempaInfo.potensi}\n📢 Dirasakan: ${gempaInfo.dirasakan}\n📷 Gambar Peta: ${gempaInfo.gambar}\n\nJaga keselamatan kalian!`;
            await sendReminderToGroup(chatId, reminderMessage);
        }
    }
}

async function sendReminderToGroup(chatId, text) {
    await global.conn.sendMessage(chatId, { text });
}

function startGempaReminder() {
    setInterval(() => {
        console.log('Mengecek data gempa terbaru...');
        getGempaInfo();
    }, 60 * 60 * 1000);
}

startGempaReminder();