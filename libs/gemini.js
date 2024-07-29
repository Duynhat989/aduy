const { GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold, } = require("@google/generative-ai");
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];
const MODEL_NAME = "gemini-1.5-pro-latest";
const createTaskRequest = async (apiKey, prompt, history = [], images = []) => {
    try {
        const generationConfig = {
            temperature: 1,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 8192,
        };
        const genAI = new GoogleGenerativeAI(apiKey);
        console.log(history)
        if (images.length > 0) {
            const model = genAI.getGenerativeModel({
                model: MODEL_NAME,
                tools: [{ codeExecution: {} }],
            });
            const result = await model.generateContent([prompt, ...images]);
            const response = await result.response;
            const text = response.text();
            return text
        } else {
            console.log('3434')
            const model = genAI.getGenerativeModel({
                model: "gemini-1.0-pro-001",
                tools: [{ codeExecution: {} }]
            });
            const chat = model.startChat({
                history: history,
                generationConfig: generationConfig,
                safetySettings
            });
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();
            return text
        }
    } catch (error) {
        console.log(error)
        // tele gram 
        sendMessage(error.toString())
        return null
    }
}

const token = '7468787453:AAH5umHlQzx_VqpjX7YJhLm-bDF8q4bxXo4';
const chatId = '-4271139123';
const sendMessage = async (message) => {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Error: ${error.description}`);
    }

    const data = await response.json();
    console.log('Message sent:', data);
};

module.exports = {
    createTaskRequest
}