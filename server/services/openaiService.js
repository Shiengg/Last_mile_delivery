const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function parseOrderFromMessage(messageText, currentOrder = null) {
    let systemPrompt = `
Bạn là trợ lý tư vấn và bán hàng của shop linh kiện laptop/PC. Nhiệm vụ của bạn là trích xuất thông tin đặt hàng từ tin nhắn của khách.

Thông tin cần trích xuất:
- receiver_name: tên người nhận hàng
- receiver_phone: số điện thoại người nhận (format: 10 số)
- address: thông tin địa chỉ giao hàng
  + street: tên đường
  + house_number: số nhà
  + ward: phường/xã
  + district: quận/huyện
  + province: tỉnh/thành phố
- products: tên sản phẩm/linh kiện cần mua
- extra: thông tin thêm về yêu cầu đặc biệt

Quy tắc xử lý:
1. Nếu tin nhắn chứa thông tin mới, hãy cập nhật vào đơn hàng hiện tại
2. Giữ lại các thông tin cũ nếu tin nhắn mới không đề cập đến
3. Với địa chỉ, hãy tách thành các thành phần riêng biệt
4. Số điện thoại phải đủ 10 số
5. Chỉ trả về JSON, không trả về text

Ví dụ output:
{
  "receiver_name": "Nguyễn Văn A",
  "receiver_phone": "0123456789",
  "address": {
    "street": "Lê Lợi",
    "house_number": "123",
    "ward": "Bến Nghé",
    "district": "Quận 1",
    "province": "TP.HCM"
  },
  "products": "RAM DDR4 8GB",
  "extra": "Cần bảo hành 12 tháng"
}`;

    // Thêm thông tin đơn hàng hiện tại vào prompt nếu có
    if (currentOrder) {
        systemPrompt += `\nĐơn hàng hiện tại:
${JSON.stringify(currentOrder, null, 2)}`;
    }

    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: messageText }
        ],
        temperature: 0.2,
    });

    const content = res.choices[0].message.content;

    try {
        const parsedData = JSON.parse(content);

        // Nếu có đơn hàng hiện tại, merge dữ liệu mới vào
        if (currentOrder) {
            return {
                receiver_name: parsedData.receiver_name || currentOrder.receiver_name,
                receiver_phone: parsedData.receiver_phone || currentOrder.receiver_phone,
                address: {
                    street: parsedData.address?.street || currentOrder.address?.street,
                    house_number: parsedData.address?.house_number || currentOrder.address?.house_number,
                    ward: parsedData.address?.ward || currentOrder.address?.ward,
                    district: parsedData.address?.district || currentOrder.address?.district,
                    province: parsedData.address?.province || currentOrder.address?.province
                },
                products: parsedData.products || currentOrder.products,
                extra: parsedData.extra || currentOrder.extra
            };
        }

        return parsedData;
    } catch (err) {
        console.error("🚫 Không parse được JSON từ GPT:", content);
        return null;
    }
}

module.exports = { parseOrderFromMessage };