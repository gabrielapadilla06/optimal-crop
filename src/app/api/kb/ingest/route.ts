import { Document as VectorDocument } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createVectorStore } from "@/lib/ai";

export async function POST(request: Request){

    const formData = await request.formData();
    if (!formData.has("file")){
        return Response.json({error: "No file found"}, {status: 400});
    }
    const file = formData.get("file") as File;
    const fileExtension = file.name.split(".").pop()
    if (!fileExtension || !["txt", "md"].includes(fileExtension)) {
        return Response.json({error: "Invalid file type"}, {status: 400});
    }

    let text = await file.text();

    const doc = new VectorDocument({
        pageContent: text,
        metadata: {
            sourceFile: file.name,
            sourceType: "file"
        }
    });

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments([doc]);

    const vectorStore = await createVectorStore();
    await vectorStore.addDocuments(splits);
    return Response.json({ message: "Ingested successfully" });
}
