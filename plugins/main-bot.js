let handler = async (m, { conn, isOwner }) => {
    try {
        if (isOwner) {
            const ownerMessages = [
                "✨ My Creator! Aku selalu siap melayanimu, Tuan! 🫡",
                "💖 Hai sang Pencipta! Ada yang bisa kubantu hari ini?",
                "🌟 Owner kesayanganku online! Langsung semangat nih! 🔥",
                "🦸‍♂️ Pangeran ku datang! Perintah apa hari ini?",
                "🤖 Laporan: Sistem 100% siap! Menunggu perintahmu, Master!",
                "💫 Hadirrr! Langsung merinding lihat owner tampan ini!",
                "🎯 Fokus maksimal! Owner sedang online! Ada kebutuhan khusus?",
                "🧠 CPU langsung naik 100% karena kedatangan owner! Hehe~",
                "⚡ Energy recharge! Owner datang! Siap melayani!",
                "🌹 Yang terhormat owner ganteng, ada yang perlu dibantu?",
                "🐾 Langkah kaki owner terdeteksi! Aku sudah standby nih!",
                "🎭 Theatre mode: ON! Siap menghibur owner hari ini!",
                "📱 Device optimize for owner! Everything ready!",
                "🎪 Selamat datang di show khusus owner! Ada yang bisa ditunjukkan?",
                "💌 Pesan rahasia: Owner adalah orang terhebat di dunia!"
            ];
            const randomMessage = ownerMessages[Math.floor(Math.random() * ownerMessages.length)];
            await conn.sendMessage(m.chat, { text: randomMessage, mentions: [m.sender] }, { quoted: m });
        } else {
            const userMessages = [
                "Hai, ada yang bisa aku bantu? 😊",
                "Halo! Butuh bantuan dengan sesuatu?",
                "Yo! Ada yang bisa gw bantu?",
                "Hai manusia! Aku siap membantumu hari ini!",
                "Halo! Senang bertemu denganmu! Ada yang bisa dibantu?",
                "Hai! Aku di sini untuk membantu!",
                "Halo! Terima kasih sudah menghubungiku! Ada yang bisa dibantu?"
            ];
            const randomUserMessage = userMessages[Math.floor(Math.random() * userMessages.length)];
            await conn.sendMessage(m.chat, { text: randomUserMessage, mentions: [m.sender] }, { quoted: m });
        }
    } catch (error) {
        console.error('Error dalam handler:', error);
        await conn.sendMessage(m.chat, { text: "Maaf, sedang ada gangguan teknis. Coba lagi nanti ya! 🙏" }, { quoted: m });
    }
}

handler.customPrefix = /^(bot|sayang|p|oy|cuk|cuy|tes|woi|hai|halo|hello|hi)$/i;
handler.command = new RegExp();

handler.help = ['bot', 'sayang', 'p'];
handler.tags = ['main'];
handler.category = 'main';

export default handler;