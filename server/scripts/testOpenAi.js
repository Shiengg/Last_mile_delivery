const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

(async () => {
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: "Chào bạn, bạn khỏe không?" }
        ]
    });

    console.log(res.choices[0].message.content);
})();