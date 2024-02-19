const express = require("express");
const fileUpload = require("express-fileupload");
const { config } = require("dotenv");
const PdfParse = require("pdf-parse");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { loadQAChain } = require("langchain/chains");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use("/", express.static("public"));
app.use(fileUpload());
process.env.NODE_NO_WARNINGS = 1;
config({ path: ".env.local" });
//
app.post("/extract-text", async (req, res) => {
  const pdfFilePath = req.files.pdfFile;

  PdfParse(pdfFilePath).then(async (result) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
      separator: "\n",
      chunkSize: 500,
      chunkOverlap: 150,
    });

    const apiKey = process.env.API_KEY;
    try {
      let chunks = await textSplitter.splitText(result.text);
      const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-1.0-pro",
        apiKey: apiKey,
      });

      const vectorstore = await FaissStore.fromTexts(chunks, {}, embeddings);
      await vectorstore.save("./vector-store");
      const responseData =
        "Your pdf loaded successfully ,now you can go ahead and ask questions about it,but please be specific to question";
      console.log("in req");
      res.json({ answer: responseData });
      // chunks.forEach((chunk, index) => {
      //   res.write(`Chunk ${index + 1}:\n`);
      //   res.write(JSON.stringify(chunk) + "\n");
      // });
      // res.end();
    } catch (error) {
      console.log("err");
      console.error("Error processing text:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/response-text", async (req, res) => {
  console.log("Received question:", req.body.question);

  const apiKey = process.env.API_KEY;
  getConversation();
  function getConversation() {
    const prompt_template = `Answer the question as details as possible and also give page no. reference  \n\n
        Context:\n {context}? \n
        Question:\n {question} \n

        Answer:
        `;
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-pro",
      apiKey: apiKey,
      temperature: 0.3,
      // topK: 1,
      // topP: 1,
      maxOutputTokens: 2048,
    });

    const prompt = new PromptTemplate({
      inputVariables: ["context", "question"],
      template: prompt_template,
    });

    const chain = loadQAChain(model, {
      type: "stuff",
      prompt: prompt,
    });

    return chain;
  }
  userinput();
  async function userinput() {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-1.0-pro",
      apiKey: apiKey,
    });

    let db = await FaissStore.load("./vector-store", embeddings);

    const userquest = req.body.question;
    const docs = await db.similaritySearch(userquest);

    //console.log(docs);
    // const pageContents = docs.map((doc) => doc.pageContent);

    // const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    // const chat = model.startChat({
    //   history: [
    //     {
    //       role: "user",
    //       parts: pageContents,
    //     },
    //     {
    //       role: "model",
    //       parts:
    //         "Great to meet you.,ask only from provided context, What would you like to know from provided context? also give answer refering provided context only",
    //     },
    //   ],
    //   generationConfig: {
    //     maxOutputTokens: 2048,
    //     temperature: 0.1,
    //   },
    // });

    // const msg =
    //   "Can you give me an example from history where the enemy was crushed totally from the book?";

    // const result = await chat.sendMessage(msg);
    // const response = result.response;

    // const text = response.text();
    // console.log("1sts");
    // console.log(text);
    //
    //
    //

    const chain = getConversation();

    await logResponse(docs, userquest);
    async function logResponse(docs, userquest) {
      console.log("in here");

      const response1 = await chain.invoke(
        {
          input_documents: docs,
          question: userquest,
        },
        { return_only_outputs: true }
      );

      console.log(response1.text);
      res.json({ answer: response1.text });
    }
  }
});

app.listen(3000, () => {
  console.log("API WRKing on 3000 port");
});
