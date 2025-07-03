const express = require("express");
const router = express.Router();
const axios = require("axios");
const { parseOrderFromMessage } = require("../services/openaiService");
const { updateOrder, getOrder, clearOrder, validateOrder, createOrder } = require("../services/orderService");

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "verify_token";
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || "EAAG..."; // 🔒 Thay bằng token thật của bạn
const PAGE_ID = process.env.FB_PAGE_ID;

// Cache để lưu các tin nhắn đã xử lý
const processedMessages = new Set();
const CACHE_TIMEOUT = 60000; // 60 seconds

// Hàm kiểm tra tin nhắn chào hỏi
function isGreeting(message) {
    const greetings = ['xin chào', 'chào', 'hi', 'hello', 'hey'];
    return greetings.some(greeting => message.toLowerCase().includes(greeting));
}

// Hàm kiểm tra xác nhận đơn hàng
function isOrderConfirmation(message) {
    const confirmations = ['xác nhận đơn', 'xác nhận', 'đồng ý', 'ok'];
    return confirmations.some(confirm => message.toLowerCase().includes(confirm));
}

// Hàm tạo tin nhắn xác nhận đơn hàng
function createOrderConfirmMessage(order) {
    return `📦 Xác nhận đơn hàng:
🧑 Người nhận: ${order.receiver_name}
📞 SĐT: ${order.receiver_phone}
📍 Địa chỉ: ${order.address.house_number} ${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}
🛒 Sản phẩm: ${order.products}${order.extra ? `\n📝 Yêu cầu thêm: ${order.extra}` : ""}

✅ Vui lòng kiểm tra lại thông tin trên.
👉 Nếu thông tin chính xác, hãy nhắn "Xác nhận đơn" để hoàn tất đặt hàng.
❌ Nếu cần chỉnh sửa, vui lòng nhắn lại thông tin cần thay đổi.`;
}

// ⚙️ Xác thực webhook từ Facebook
router.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified!");
        return res.status(200).send(challenge);
    } else {
        console.log("❌ Verification failed");
        return res.sendStatus(403);
    }
});

// 📬 Xử lý khi có tin nhắn gửi từ Messenger vào
router.post("/", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        for (const entry of body.entry) {
            if (PAGE_ID && entry.id !== PAGE_ID) continue;

            const webhookEvent = entry.messaging[0];
            if (!webhookEvent || !webhookEvent.sender) continue;

            const senderId = webhookEvent.sender.id;

            if (webhookEvent.message && webhookEvent.message.text) {
                if (webhookEvent.message.is_echo) return;

                const userMsg = webhookEvent.message.text;
                const messageId = webhookEvent.message.mid;

                // Kiểm tra xem tin nhắn đã được xử lý chưa
                if (processedMessages.has(messageId)) {
                    return res.status(200).send("DUPLICATE_MESSAGE");
                }

                // Thêm tin nhắn vào cache
                processedMessages.add(messageId);
                setTimeout(() => processedMessages.delete(messageId), CACHE_TIMEOUT);

                console.log("📨 Tin nhắn từ user:", userMsg);

                // Xử lý tin nhắn chào hỏi
                if (isGreeting(userMsg)) {
                    await sendMessage(senderId, `Xin chào! Chào mừng bạn đến với shop linh kiện laptop/PC của chúng tôi 🖥️

Để đặt hàng, vui lòng cung cấp các thông tin sau:
- Tên người nhận
- Số điện thoại liên hệ
- Địa chỉ giao hàng đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)
- Tên sản phẩm/linh kiện cần mua (ví dụ: RAM DDR4 8GB, SSD 256GB)
- Yêu cầu thêm nếu có (bảo hành, lắp đặt, v.v.)

Bạn có thể cho mình biết bạn cần mua sản phẩm gì không ạ?`);
                    return res.status(200).send("EVENT_RECEIVED");
                }

                // Kiểm tra nếu là tin nhắn xác nhận đơn hàng
                if (isOrderConfirmation(userMsg)) {
                    const currentOrder = getOrder(senderId);
                    if (!currentOrder) {
                        await sendMessage(senderId, "Xin lỗi, tôi chưa nhận được thông tin đơn hàng của bạn. Vui lòng cung cấp thông tin đặt hàng trước ạ.");
                        return res.status(200).send("EVENT_RECEIVED");
                    }

                    const missingFields = validateOrder(currentOrder);
                    if (missingFields.length > 0) {
                        await sendMessage(senderId, `Để hoàn tất đơn hàng, vui lòng cung cấp thêm thông tin sau:\n${missingFields.map(field => `- ${field}`).join('\n')}`);
                        return res.status(200).send("EVENT_RECEIVED");
                    }

                    try {
                        // Tạo đơn hàng trong database
                        const order = await createOrder(senderId, currentOrder);

                        // Gửi thông báo xác nhận
                        await sendMessage(senderId, `🎉 Đơn hàng #${order.order_id} đã được tạo thành công!

📦 Chi tiết đơn hàng:
🧑 Người nhận: ${order.destination.receiver_name}
📞 SĐT: ${order.destination.receiver_phone}
📍 Địa chỉ: ${order.destination.address.house_number} ${order.destination.address.street}, ${order.destination.address.ward_code}, ${order.destination.address.district_id}, ${order.destination.address.province_id}
🛒 Sản phẩm: ${currentOrder.products}
${currentOrder.extra ? `📝 Ghi chú: ${currentOrder.extra}\n` : ''}
⏰ Thời gian giao hàng dự kiến: ${order.estimated_delivery_time.toLocaleString('vi-VN')}

📞 Nhân viên của shop sẽ liên hệ với bạn để xác nhận lại đơn hàng trong thời gian sớm nhất.
❓ Nếu cần hỗ trợ, vui lòng liên hệ hotline: 1900.xxxx`);

                        // Xóa đơn hàng tạm thời
                        clearOrder(senderId);
                    } catch (error) {
                        console.error('Lỗi khi tạo đơn hàng:', error);
                        await sendMessage(senderId, "❌ Rất tiếc đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau hoặc liên hệ hotline của shop để được hỗ trợ.");
                    }

                    return res.status(200).send("EVENT_RECEIVED");
                }

                try {
                    const currentOrder = getOrder(senderId);
                    const aiData = await parseOrderFromMessage(userMsg, currentOrder);

                    if (!aiData) {
                        if (currentOrder) {
                            const missingFields = validateOrder(currentOrder);
                            await sendMessage(senderId, `Tôi chưa hiểu rõ thông tin bạn vừa cung cấp. Bạn vui lòng cung cấp các thông tin còn thiếu:\n${missingFields.map(field => `- ${field}`).join('\n')}`);
                        } else {
                            await sendMessage(senderId, "Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn. Bạn có thể cho mình biết cụ thể hơn về sản phẩm bạn cần mua được không ạ?");
                        }
                        return res.status(200).send("EVENT_RECEIVED");
                    }

                    // Cập nhật thông tin đơn hàng
                    const updatedOrder = updateOrder(senderId, aiData);
                    const missingFields = validateOrder(updatedOrder);

                    if (missingFields.length > 0) {
                        await sendMessage(senderId, `Cảm ơn bạn đã cung cấp thông tin. Để hoàn tất đơn hàng, vui lòng cung cấp thêm:\n${missingFields.map(field => `- ${field}`).join('\n')}`);
                    } else {
                        await sendMessage(senderId, createOrderConfirmMessage(updatedOrder));
                    }

                } catch (error) {
                    console.error("❌ Lỗi xử lý AI:", error.message);
                    await sendMessage(senderId, "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline của shop để được hỗ trợ.");
                }
            }
        }

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

// ➤ Gửi tin nhắn lại cho Facebook User
async function sendMessage(recipientId, messageText) {
    try {
        const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
        const response = await axios.post(url, {
            recipient: { id: recipientId },
            message: { text: messageText }
        });
        console.log("✅ Gửi tin nhắn thành công");
    } catch (err) {
        console.error("❌ Gửi tin nhắn thất bại:", err.response?.data?.error?.message || err.message);
    }
}

module.exports = router;