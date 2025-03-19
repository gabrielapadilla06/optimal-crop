import { NextResponse } from "next/server";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createVectorStore, llm } from "@/lib/ai";
import { QA_SYSTEM_PROMPT } from "@/lib/prompts";
import { ChatMessage } from "@/lib/types";

interface RetrieveRequest{
    question: string;
    messages: ChatMessage[];
    maxLastMessages?: number;
}

interface PromptTemplateInput {
    context: string;
    question: string;
    chatHistory: BaseMessage[];
}

export async function POST(request: Request) {
    const data: RetrieveRequest = await request.json();
    const { question, messages, maxLastMessages = 10 } = data;

    const vectorStore = await createVectorStore();
    const retriever = vectorStore.asRetriever({
        k: 3,
    });
    const results = await retriever.invoke(question);
  
    const context = results
      .map((doc, i) => `Extract ${i + 1}:\n${doc.pageContent}`)
      .join("\n\n");

    const chatHistory = messages.slice(-maxLastMessages).map((message) => {
        if (message.role === "user") {
            return new HumanMessage(message.content);
          } else {
            return new AIMessage(message.content);
          }
    });

    const promptTemplate = ChatPromptTemplate.fromMessages<PromptTemplateInput>([
        ["system", QA_SYSTEM_PROMPT],
        new MessagesPlaceholder("chatHistory"),
        ["human", "{question}"],
    ]);

    const outputParser = new StringOutputParser();
    const chain = promptTemplate.pipe(llm).pipe(outputParser);
    const chainOutput = await chain.stream({
        context: context,
        question: question,
        chatHistory: chatHistory,
    });

    const stream = new ReadableStream({
        start: async (controller) => {
          const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
          try {
            // Iterate over the streamed chunks of the response
            for await (const chunkContent of chainOutput) {
              if (chunkContent) {
                const text = encoder.encode(chunkContent) // Encode the content to Uint8Array
                controller.enqueue(text) // Enqueue the encoded text to the stream
              }
            }
          } catch (err) {
            controller.error(err) // Handle any errors that occur during streaming
          } finally {
            controller.close() // Close the stream when done
          }
        },
    });

    return new NextResponse(stream);
}