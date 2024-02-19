// import express from "express";
// import fileUpload from "express-fileupload";
const express = require("express");
const fileUpload = require("express-fileupload");
const { config } = require("dotenv");
const PdfParse = require("pdf-parse");
const faiss = require("faiss");
const faissn = require("faiss-node");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { HfInference } = require("@huggingface/inference");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { loadQAChain } = require("langchain/chains");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ConversationalBufferMemory } = require("langchain/vectorstores/memory");
const app = express();
app.use("/", express.static("public"));
app.use(fileUpload());
process.env.NODE_NO_WARNINGS = 1;
config({ path: ".env.local" });
const FormData = require("form-data");
//
app.post("/extract-text", async (req, res) => {
  const pdfFilePath = req.files.pdfFile;
  console.log("in req");

  PdfParse(pdfFilePath).then(async (result) => {
    //res.send(result.text);
    const textSplitter = new RecursiveCharacterTextSplitter({
      separator: "\n",
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const apiKey = process.env.API_KEY;
    try {
      let chunks = await textSplitter.splitText(result.text);
      const embeddings = new GoogleGenerativeAIEmbeddings(
        // (model = "models/embedding-001"),
        {
          model: "models/embedding-001",
          apiKey: apiKey,
        }
      );
      // console.log(embeddings);
      // console.log("hello");
      // // console.log(typeof chunks);
      // console.log(Array.isArray(chunks));

      // const vectorstore = await FaissStore.fromTexts(chunks, {}, embeddings);
      // console.log("vectorestore");
      // console.log(vectorstore);
      // await vectorstore.save("./vector-store");
      console.log("before");
      const vectorstore = await FaissStore.fromTexts(chunks, {}, embeddings);
      console.log("after vectorstore");
      //console.log(vectorstore);
      await vectorstore.save("./vector-store");
      // localStorage.setItem("myData", vectorstore);
      // console.log(ChatGoogleGenerativeAI);
      getConversation();
      function getConversation() {
        const prompt_template = `Answer the question as detailed as possible from the provided context, make sure to provide all the details, if the answer is not in
    provided context just say, "answer is not available in the context", don't provide the wrong answer\n\n
    Context:\n {context}? \n
    Question:\n {question} \n

    Answer:
    `;
        const model = new ChatGoogleGenerativeAI(
          // (model = "models/embedding-001"),
          {
            model: "gemini-pro",
            temperature: 0.3,
            apiKey: apiKey,
          }
        );
        //console.log(model);
        console.log("after model");
        //console.log(PromptTemplate);
        // const promptex = new PromptTemplate({
        //   inputVariables: ["foo"],
        //   template: "Say {foo}",
        // });
        // console.log(promptex);
        console.log("helloooo");
        const prompt = new PromptTemplate({
          inputVariables: ["context", "question"],
          template: prompt_template,
        });

        //console.log(prompt);
        console.log("after promt");
        console.log(loadQAChain);
        // const chain = loadQAChain({
        //   model,
        //   chain_type: "stuff",
        //   prompt: prompt,
        // });
        const chain = loadQAChain(model, {
          type: "stuff",
          prompt: prompt,
        });
        console.log("after chain");
        console.log(chain);
        return chain;
      }
      //console.log(chain);
      userinput();
      async function userinput() {
        const embeddings = new GoogleGenerativeAIEmbeddings(
          // (model = "models/embedding-001"),
          {
            model: "models/embedding-001",
            apiKey: apiKey,
          }
        );
        console.log("checking");
        let db = await FaissStore.load("./vector-store", embeddings);
        console.log(db);
        console.log("in userinput");
        //console.log(db);
        const userquest = "Finance  Minister";
        // const docs = await db.similaritySearch(userquest);
        // console.log("docs");
        // console.log(docs);

        console.log("in try");
        const docs = await db.similaritySearch(userquest);
        console.log("docs");
        console.log(docs);

        const chain = getConversation();
        console.log("chain received");
        // console.log(chain.invoke);
        // const response = chain(
        //   {
        //     input_documents: docs,
        //     question: userquest,
        //   },
        //   {
        //     return_only_outputs: true,
        //   }
        // );
        // console.log(response);

        //
        //
        //
        // const response1 = chain._selectMemoryInputs(
        //   {
        //     input_documents: docs,
        //     question: userquest,
        //   },
        //   { return_only_outputs: true }
        // );
        // console.log(response1);
        logResponse(docs, userquest);
        async function logResponse(docs, userquest) {
          console.log("in response");
          // const response1 = await chain.invoke(
          //   {
          //     input_documents: docs,
          //     question: userquest,
          //   },
          //   { return_only_outputs: true }
          // );
          const response1 = await chain.invoke(
            {
              input_documents: docs,
              question: userquest,
            },
            { return_only_outputs: true }
          );
          console.log(response1.text);
        }
      }

      // const prompt = new PromptTemplate(
      //   (template = prompt_template),
      //   (input_variables = ["context", "question"])
      // );

      //console.log(vectorstore);
      // await vectorstore.save("./vector-store");
      // localStorage.setItem("myData", vectorstore);

      chunks.forEach((chunk, index) => {
        // console.log(`Chunk ${index + 1}:`);
        // console.log(chunk);
        res.write(`Chunk ${index + 1}:\n`);
        res.write(JSON.stringify(chunk) + "\n");
        // console.log(typeof chunks);
      });
      //res.send("Your plain text here");
      // res.json({ key: "value" });
      res.end();
    } catch (error) {
      console.log("err");
      console.error("Error processing text:", error);
      // Handle the error and possibly send an error response to the front end.
      res.status(500).send("Internal Server Error");
    }
  });
});
//
run();
//
async function run() {}
//
app.listen(3000, () => {
  console.log("API WRKing on 3000 port");
});
