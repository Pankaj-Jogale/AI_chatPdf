import express from "express";
import fileUpload from "express-fileupload";
import PdfParse from "pdf-parse";
import path from "path";
import pdfParse from "pdf-parse";
import { HfInference } from "@huggingface/inference";
//const express = require("express");
//const fileUpload = require("express-fileupload");
// const path = require("path");
// const PdfParse = require("pdf-parse");
// const pdf = require("pdf-parse");
const fs = require("fs");
//const { PdfReader } = require("pdfreader");
//const { HfInference } = require("@huggingface/inference");
const { config } = require("dotenv");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
// const { GoogleGenerativeAIEmbeddings } = require("langchain/embeddings");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/core/embeddings");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  ChromaClient,
  GoogleGenerativeAiEmbeddingFunction,
} = require("chromadb");

//const ChromaClient = require("@langchain/community/chromadb");
//const { FaissStore } = require("langchain/vectorstores/faiss");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { faiss } = require("faiss");

//import { HfInference } from "https://esm.sh/@huggingface/inference";

const app = express();
//app.use(express.json());
app.use("/", express.static("public"));
app.use(fileUpload());
process.env.NODE_NO_WARNINGS = 1;
config({ path: ".env.local" });
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const client = new ChromaClient();
console.log("heyy" + faiss);
app.post("/extract-text", (req, res) => {
  const pdfFilePath = req.files.pdfFile;

  try {
    console.log("in req");
    if (!req.files || !req.files.pdfFile) {
      console.log("1st if");
      res.status(400).end();
      return;
    }

    PdfParse(pdfFilePath).then(async (result) => {
      //res.send(result.text);
      //console.log(typeof result.text);

      const textSplitter = new RecursiveCharacterTextSplitter({
        separator: "\n",
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      let chunks = await textSplitter.splitText(result.text);
      //console.log(chunks);
      chunks.forEach((chunk, index) => {
        // console.log(`Chunk ${index + 1}:`);
        // console.log(chunk);
        // res.write(`Chunk ${index + 1}:\n`);
        // res.write(JSON.stringify(chunk) + "\n");
        // console.log(typeof chunks);
      });

      //processText(chunks);
      //
      //
      //
      console.log(FaissStore);
      run();
      async function run() {
        // For embeddings, use the embedding-001 model
        // const model = genAI.getGenerativeModel({ model: "embedding-001" });
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "i want to chat with pdf but using node js?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
        //const text = "The quick brown fox jumps over the lazy dog.";
        // const textArray = ["text1", "text2", "text3"];
        //const result = await model.embedContent(textArray);
        // const embedding = result.embedding;
        // console.log(embedding.values);
      }
      //
      //
      // const embedder = new GoogleGenerativeAiEmbeddingFunction({
      //   googleApiKey: process.env.API_KEY,
      // });
      // const embeddings = await embedder.generate(["document1", "document2"]);
      // const client = new ChromaClient();
      // // pass documents to query for .add and .query
      // console.log("Before createCollection");
      // const collection = await client.createCollection({
      //   name: "name",
      //   embeddingFunction: embedder,
      // });
      // console.log("After createCollection", collection);
      // const collectionGet = await client.getCollection({
      //   name: "name",
      //   embeddingFunction: embedder,
      // });
      // console.log(embeddings);
      // console.log(collection);
      // console.log(collectionGet);
      //
      //
      //
      // getAndSaveVectorStore(chunks)
      //   .then(() => console.log("Vector store created and saved successfully"))
      //   .catch((error) => console.error("Error:", error));
      //   res.send(
      //   chunks.forEach((chunk, index) => {
      //     res.write(`Chunk ${index + 1}:\n`);
      //     res.write(JSON.stringify(chunk) + "\n");
      //   })
      // );
      // textSplitter
      //   .splitText(result.text)
      //   .then((chunks) => {
      //     // Log or process each chunk as needed
      //     chunks.forEach((chunk, index) => {
      //       // console.log(`Chunk ${index + 1}:`);
      //       // console.log(chunk);
      //       // res.write(`Chunk ${index + 1}:\n`);
      //       // res.write(JSON.stringify(chunk) + "\n");
      //       //console.log(typeof chunks);
      //     });
      //     //res.json({ chunks });
      //     //res.end();
      //     res.send(chunks);
      //   })
      //   .catch((error) => {
      //     console.error("Error:", error);
      //   });
      //
      //
      //
    });

    // new PdfReader().parseFileItems(pdfFilePath, (err, item) => {
    //   if (err) {
    //     console.log("2nd if");
    //     console.log(err);
    //     res.status(500).end();
    //   } else if (!item) {
    //     console.log("3rd if");

    //     console.warn("end of file");
    //     res.status(200).end();
    //   } else if (item.text) {
    //     console.log("4th if");

    //     console.log(item.text);
    //     res.send(item.text);
    //   }
    // });
  } catch (error) {
    console.error("Error in /extract-text route:", error);
    res.status(500).end();
  }
});

app.listen(3000, () => {
  console.log("API WRKing on 3000 port");
});

async function processText(chunks) {
  const hf = new HfInference(process.env.HF_TOKEN);
  try {
    console.log("in processing");
    const output = await hf.featureExtraction({
      model: "intfloat/e5-small-v2",
      // model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: "pankaj",
    });
    console.log(output);
    const output2 = await hf.featureExtraction({
      model: "intfloat/e5-small-v2", //less accurate
      // model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: "pankaj",
    });
  } catch (error) {
    console.error("Error during feature extraction:", error.message);
    // Handle the error appropriately (e.g., retry, log, display a message to the user)
  }
  //const similarity = dotProduct(output, output2);
  //console.log("similarity" + similarity);

  //
  //
  console.log(FaissStore);
  // const vectorstore = await FaissStore.fromTexts(chunks, {}, chunks);
  // console.log(vectorstore);
}
//
//
async function getAndSaveVectorStore(textChunks) {
  const client = new ChromaClient({
    path: "http://localhost:8000",
  });

  // Create or get a collection
  const collectionName = "my_collection";
  const collection = await client.getOrCreateCollection({
    name: collectionName,
  });

  // Your document data
  const documentData = {
    key1: "value1",
    key2: "value2",
  };

  // Add the document to the collection
  const Store = await collection.addDocument(documentData);
  console.log(Store);

  console.log(db);
  const documents = [textChunks];
  for (const document of documents) {
    db.addDocument(document);
  }
  const faissStore = await FaissStore.fromDocuments(
    db.getDocuments(),
    embeddings,
    { docstore: db }
  );
  await faissStore.save("faiss_index");
  console.log("done rererere");
  // Step 1: Use an embedding model to embed the text chunks
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  // const model = new GoogleGenerativeAIEmbeddings({ model: "embedding-001" });
  const embeddings = await Promise.all(
    textChunks.map((chunk) => model.embedContent(chunk))
  );

  // Extract vectors from the embedding results
  const vectors = embeddings.map((result) => result.embedding.values);

  // Step 2: Create a FaissStore and save it locally
  console.log(FaissStore);
  //const faissStore = await FaissStore.fromTexts([], [], embeddings);
  //await faissStore.save("faiss_index");
  console.log(faissStore);
}

// class MyEmbeddingFunction {
//   private api_key: string;

//   constructor(api_key: string) {
//     this.api_key = api_key;
//   }

//   public async generate(texts: string[]): Promise<number[][]> {
//     // do things to turn texts into embeddings with an api_key perhaps
//     return embeddings;
//   }
// }
function dotProduct(a, b) {
  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }
  console.log("simi" + result);
  return result;
}

//processText();

/*const genAI = new GoogleGenerativeAI(process.env.API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const { totalTokens } = await model.countTokens(userquest);
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: `Pankaj Ravindra Jogale
Mumbai, India +91 8149259282 pankajjogale3@gmail.com
LinkedIn https://pankaj-jogale-portfolio.web.app
Summary
Skilled Java and Full Stack developer with a strong problem-solving background. Proven
ability to build relationships & drive successful projects through effective communication.
Quick learner with exceptional teamwork and multitasking abilities, Enthusiastic about
coding and dedicated to expanding knowledge.
Skills
Programming Languages: Java, JavaScript
Database Management: SQL, MySQL
Web Development: HTML, CSS, React.js, Node.js, Express.js, Bootstrap
Education
❖ Post graduation diploma In Advance Computing (CDAC) Sep 2022 - Mar 2023
Specialization: Software and Web Development.
• Developed expertise in a range of development technologies, including Java, JavaScript,
ReactJS, NodeJS, ExpressJS, MySQL, and operating systems.
• Designed, developed, and implemented diverse applications for web and mobile platforms.
• Created user-friendly interfaces with interactive designs to enhance user engagement.
Bachelor of Engineering (Mechanical) July 2017- Nov 2020
➢ Savitribai Phule Pune University
Engaged in engineering projects and contributed to innovative mechanical systems.
Projects
➢ CDAC Mumbai-Social Media App GitHub Feb 2023 - Mar 2023
• Developed a responsive user interface using React.js and CSS, enabling users to perform
CRUD operations on their profiles, view posts and stories.
• Implemented key functionalities, including the ability for users to follow, like, comment,
message, and visit other users.Backend powered by Node.js and Express.js for seamless
operation.
Other-projects:
➢ Web portfolio - Created a web portfolio to showcase personal projects, skills, and
achievements. GitHub
➢ WhatsApp Clone (React.js & express.js)- Developed a WhatsApp clone with React.js and
Express.js, enabling \messaging functionalities. GitHub
Experience
Process Executive • Spectrum Consultants India Pvt ltd Apr 2021 - Jan 2022
• Processed media content (images and videos) for self-driving vehicle training using ML
models.
• Conducted rigorous quality assurance and data labeling to enhance accuracy and reliability
of training data.Developed high-quality datasets for ML model training.
• Implemented advanced machine learning techniques to improve training accuracy and
speed. Monitored and tracked project progress to meet delivery deadlines.`,
          },
          {
            role: "model",
            parts: "Great to meet you. What would you like to know?",
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
        },
      });
      const msg = "Summarize this given text?";

      const result = await chat.sendMessage(msg);
      const response = await result.response;
      const text = response.text();
      console.log(text);
      console.log(totalTokens);

      */
