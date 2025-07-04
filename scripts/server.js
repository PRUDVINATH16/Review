// server.js
import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import cors from "cors";
import * as dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
dotenv.config();
const API_KEY = process.env.GOOGLE_API_KEY;
const app = express();
app.use(cors({
  'methods': 'POST',
  'origin': '*',
  'allowedHeaders': 'Content-Type'
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve index.html
app.use(express.static(__dirname));

// Optional: For any other route, serve index.html
app.use(express.static(path.join(__dirname, "../review")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../review/index.html"));
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: API_KEY,
});

const prompt1 = ChatPromptTemplate.fromTemplate(
  "Translate this english movie into {language}. Review: {review}"
);
const prompt2 = ChatPromptTemplate.fromTemplate(
  "Summarize this {language} review in {language} only. Review: {review}"
);
const prompt3 = ChatPromptTemplate.fromTemplate(
  "Analyze the following movie review and respond with one of the following sentiments: HIT (positive), FLOP (negative), or AVERAGE (neutral). Review: {review}"
);
const parser = new StringOutputParser();

app.post("/summarize", async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { review, language } = req.body;

  const chain1 = prompt1.pipe(model).pipe(parser);
  const translatedReview = await chain1.invoke({ review, language });

  const chain2 = prompt2.pipe(model).pipe(parser);
  const summarizedReview = await chain2.invoke({ review: translatedReview, language });

  const chain3 = prompt3.pipe(model).pipe(parser);
  const sentiment = await chain3.invoke({ review });
  console.log(sentiment);
  res.json({ output: summarizedReview, sentimentt: sentiment});
});

app.listen(3000, () => console.log("Server running on port 3000"));
