const express = require('express');
const router = express.Router();
const axios = require('axios');

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'verify_token';
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || "EAAG...";

router.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        console.log("🔑 PAGE_ACCESS_TOKEN = ", PAGE_ACCESS_TOKEN?.slice(0, 10), "(length:", PAGE_ACCESS_TOKEN?.length, ")");
        console.log("✅ Webhook verified!");
        return res.status(200).send(challenge);
    } else {
        console.log("❌ Verification failed");
        return res.sendStatus(403);
    }
});

router.post("/", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach((entry) => {
            const webhookEvent = entry.messaging[0];
            const senderId = webhookEvent.sender.id;

            if (webhookEvent.message && webhookEvent.message.text) {
                const userMsg = webhookEvent.message.text.toLowerCase();
                console.log("📨 User said:", userMsg);

                // Phản hồi cố định
                console.log("🔑 PAGE_ACCESS_TOKEN = ", PAGE_ACCESS_TOKEN?.slice(0, 10), "(length:", PAGE_ACCESS_TOKEN?.length, ")");
                sendMessage(senderId, `Chào em, tôi là bot của công ty, tôi có thể giúp gì cho em?`);
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

async function sendMessage(recipientId, messageText) {
    try {
        const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

        console.log(`📤 Gửi tin nhắn đến ID: ${recipientId} - Nội dung: "${messageText}"`);

        const response = await axios.post(url, {
            recipient: { id: recipientId },
            message: { text: messageText }
        });

        console.log("✅ Gửi thành công:", response.data);
    } catch (err) {
        console.error("❌ Gửi thất bại:", err.response?.data || err.message);
    }
}

module.exports = router;