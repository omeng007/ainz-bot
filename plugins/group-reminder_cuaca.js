import axios from 'axios';

let location = 'Jakarta';

// Helper: mencari forecast terdekat dengan waktu saat ini
function getNearestForecast(forecasts) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    let nearest = forecasts[0];
    let minDiff = Infinity;

    for (const forecast of forecasts) {
        // parse waktu "HH:MM:SS"
        const [hour, minute] = forecast.waktu.split(':').map(Number);
        const forecastTotalMinutes = hour * 60 + minute;
        let diff = Math.abs(forecastTotalMinutes - currentTotalMinutes);
        // jika selisih melebihi 12 jam, ambil arah sebaliknya (untuk lingkaran 24 jam)
        if (diff > 12 * 60) diff = 24 * 60 - diff;
        if (diff < minDiff) {
            minDiff = diff;
            nearest = forecast;
        }
    }
    return nearest;
}

async function getWeatherInfo() {
    try {
        const url = `https://api.nexray.eu.cc/information/cuaca?kota=${encodeURIComponent(location)}`;
        const response = await axios.get(url);
        const data = response.data;

        if (!data.status || !data.result) {
            console.log('Data cuaca tidak tersedia');
            return;
        }

        const { location: loc, forecasts } = data.result;
        if (!forecasts || forecasts.length === 0) {
            console.log('Tidak ada data forecast');
            return;
        }

        // Ambil forecast terdekat dengan waktu sekarang
        const nearest = getNearestForecast(forecasts);

        // Hitung suhu tertinggi & terendah dari semua forecast
        let maxTemp = -Infinity, minTemp = Infinity;
        for (const f of forecasts) {
            const temp = parseInt(f.suhu.replace('°C', ''));
            if (temp > maxTemp) maxTemp = temp;
            if (temp < minTemp) minTemp = temp;
        }

        const weatherInfo = {
            location: `${loc.desa}, ${loc.kecamatan}, ${loc.provinsi}`,
            country: loc.provinsi || 'Indonesia',
            weather: nearest.cuaca,
            currentTemp: nearest.suhu,
            maxTemp: maxTemp !== -Infinity ? `${maxTemp}°C` : 'N/A',
            minTemp: minTemp !== Infinity ? `${minTemp}°C` : 'N/A',
            humidity: nearest.kelembaban,
            windSpeed: nearest.kecepatan_angin,
            windDirection: nearest.arah_angin,
            visibility: nearest.visibilitas,
            forecastTime: nearest.waktu,
            imageUrl: nearest.image_url
        };

        console.log(`
        Lokasi: ${weatherInfo.location}
        Cuaca: ${weatherInfo.weather}
        Suhu saat ini: ${weatherInfo.currentTemp}
        Suhu tertinggi: ${weatherInfo.maxTemp}
        Suhu terendah: ${weatherInfo.minTemp}
        Kelembapan: ${weatherInfo.humidity}
        Angin: ${weatherInfo.windSpeed} (${weatherInfo.windDirection})
        Visibilitas: ${weatherInfo.visibility}
        Waktu forecast: ${weatherInfo.forecastTime}
        `);

        sendWeatherReminderToGroups(weatherInfo);
    } catch (error) {
        console.error('[❗] Terjadi kesalahan saat mengambil data cuaca:', error);
    }
}

async function sendWeatherReminderToGroups(weatherInfo) {
    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (chat.notifcuaca) {
            const reminderMessage = `🌤️ *PENGINGAT CUACA* 🌤️\n\n📍 Lokasi: ${weatherInfo.location}\n🌍 Wilayah: ${weatherInfo.country}\n🕒 Waktu Forecast: ${weatherInfo.forecastTime}\n🌦️ Cuaca: ${weatherInfo.weather}\n🌡️ Suhu saat ini: ${weatherInfo.currentTemp}\n🌡️ Suhu tertinggi: ${weatherInfo.maxTemp}\n🌡️ Suhu terendah: ${weatherInfo.minTemp}\n💧 Kelembapan: ${weatherInfo.humidity}\n🌬️ Angin: ${weatherInfo.windSpeed} (${weatherInfo.windDirection})\n👁️ Visibilitas: ${weatherInfo.visibility}\n\nTetap waspada dan jaga kesehatan!`;
            await sendReminderToGroup(chatId, reminderMessage);
        }
    }
}

async function sendReminderToGroup(chatId, text) {
    await global.conn.sendMessage(chatId, { text });
}

function checkTimeAndSendWeather() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Kirim pada jam 07:00, 12:00, dan 18:00
    if ((hours === 7 || hours === 12 || hours === 18) && minutes === 0) {
        console.log('Mengambil data cuaca terbaru...');
        getWeatherInfo();
    }
}

function startDailyWeatherReminder() {
    setInterval(() => {
        checkTimeAndSendWeather();
    }, 60 * 1000); // Cek setiap menit
}

startDailyWeatherReminder();