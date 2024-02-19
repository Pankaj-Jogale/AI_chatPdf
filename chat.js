// node --version # Should be >= 18
// npm install @google/generative-ai
const { config } = require("dotenv");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
config({ path: ".env.local" });
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;

async function runChat() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Ask questions" }],
      },
      {
        role: "model",
        parts: [{ text: "Jarvis:" }],
      },
      {
        role: "user",
        parts: [{ text: "which is famous programming langauge?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Jarvis:\n\n1. Python: Python is a high-level, interpreted, general-purpose programming language. It is popular for its simplicity, readability, and extensive library support. Python is widely used in web development, data science, machine learning, and artificial intelligence.\n\n2. Java: Java is a high-level, object-oriented programming language. It is popular for its platform independence, which means Java programs can run on any platform that has a Java Virtual Machine (JVM) installed. Java is widely used in enterprise applications, web development, and mobile development.\n\n3. JavaScript: JavaScript is a high-level, interpreted programming language. It is primarily used for creating interactive web pages and applications. JavaScript is supported by all modern web browsers and is essential for building dynamic and engaging web experiences.\n\n4. C++: C++ is a general-purpose, object-oriented programming language. It is a powerful and efficient language that is used in a wide range of applications, including operating systems, embedded systems, and high-performance computing.\n\n5. C: C is a general-purpose, procedural programming language. It is the predecessor of C++ and is still widely",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "which is famous programming langauge?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "The most famous programming languages are:\n\n* **Python:** Python is a general-purpose, interpreted, high-level programming language. It is designed to be easy to read and write, and it has a large standard library. Python is used for a wide variety of applications, including web development, data science, machine learning, and artificial intelligence.\n* **Java:** Java is a general-purpose, object-oriented, high-level programming language. It is designed to be portable, meaning that it can run on any platform that has a Java Virtual Machine (JVM) installed. Java is used for a wide variety of applications, including web development, enterprise software, and mobile development.\n* **JavaScript:** JavaScript is a high-level, interpreted programming language that is used to create interactive web pages. It is supported by all modern web browsers and is essential for building dynamic and engaging web experiences. JavaScript is also used for developing mobile apps and games.\n* **C++:** C++ is a general-purpose, object-oriented, high-level programming language. It is a powerful and efficient language that is used for a wide variety of applications, including operating systems, embedded systems, and high-performance computing.\n* **C:** C is a general-purpose, procedural, high-level programming language. It is the predecessor of C++ and is still widely used for developing operating systems, embedded systems, and other low-level software.\n\nThese five programming languages are the most popular and widely used in the world. They are used by millions of developers to create a wide variety of software applications.",
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage(
    "which is famous programming langauge?"
  );
  const response = result.response;
  console.log(response.text());
}

runChat();
