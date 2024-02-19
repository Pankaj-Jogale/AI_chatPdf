console.log("hello");
// const PdfParse = require("pdf-parse");
// const fs = require("fs");
// //const { createQAClient } = require("@huggingface/node-remote-apis");
// const axios = require("axios");
// const { config } = require("dotenv");
// const { pipeline } = require("@xenova/transformers");
//import { pipeline } from "@xenova/transformers";

import fs from "fs";
// import { createQAClient } from "@huggingface/node-remote-apis";
import axios from "axios";
//import { PDFReader } from "pdfreader";

import { config } from "dotenv";
import { pipeline } from "@xenova/transformers";
import path from "path";
//const { faiss } = require("faiss");
import faiss from "faiss";
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

//
//
//
config({ path: ".env.local" });
const apiKey = process.env.HF_TOKEN;
// ...

run();
async function run() {
  let classifier = await pipeline("sentiment-analysis");
  let result = await classifier("I love transformers!");
  console.log(result);
  const answerer = await pipeline(
    "question-answering",
    "Xenova/distilbert-base-uncased-distilled-squad"
  );
  const question = "Who was Jim Henson?";
  const context = "Jim Henson was a nice puppet.";
  const output = await answerer(question, context);
  console.log(output);
}
// const output = await inference.textToImage({
//   model: "stabilityai/stable-diffusion-2",
//   inputs:
//     "award winning high resolution photo of a giant tortoise/((ladybird)) hybrid, [trending on artstation]",
//   parameters: {
//     negative_prompt: "blurry",
//   },
// });
// console.log("Complete API Response:", JSON.stringify(output, null, 2));

// console.log("API Response:", output);
const dataBuffer = fs.readFileSync("./main/Pankaj.pdf");
// PdfParse(dataBuffer).then((data) => {
//   const pdfText = data.text;
//   context = pdfText;
//   // console.log(pdfText);
//   const modelId = "Xenova/donut-base-finetuned-docvqa";
//   const userQuestion = "What is the main idea of the document?";
//   axios
//     .post(
//       `https://api-inference.huggingface.co/models/${modelId}/question-answering`,
//       {
//         question: userQuestion,
//         context: pdfText,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//         },
//       }
//     )
//     .then((response) => {
//       const answer = response.data.answer;
//       console.log(answer);
//     })
//     .catch((error) => {
//       console.error(error.response.data);
//     });
//   // Save pdfText or use it as needed
// });
//
//
//wrking code collected
async function run() {
  const apiKey = process.env.API_KEY;
  const textSplitter = new RecursiveCharacterTextSplitter({
    separator: "\n",
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  let chunks = await textSplitter.splitText(result.text);
  const embeddings = new GoogleGenerativeAIEmbeddings(
    // (model = "models/embedding-001"),
    {
      model: "models/embedding-001",
      apiKey: apiKey,
    }
  );
  //1
  const documentRes = await embeddings.embedDocuments([
    "Hello world",
    "Bye bye",
  ]);
  console.log({ documentRes });
  //
  //2

  const vectorstore = await FaissStore.fromTexts(chunks, {}, embeddings);
  console.log("vectorestore");
  console.log(vectorstore);
  await vectorstore.save("./vector-store");
}
