from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
import os
import json
import markdown

# Load environment variables
load_dotenv('.env.local')

# Initialize Pineconepyth
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Initialize OpenAI
client = OpenAI()

# Convert the formulations.md file content into text
def parse_markdown(md_file):
    with open(md_file, "r") as f:
        md_content = f.read()

    # Convert markdown to plain text using markdown library
    html_content = markdown.markdown(md_content)
    
    # Optionally, further process the HTML if needed
    # For now, let's just return the raw HTML
    return html_content

# Read and parse the formulations.md file
md_file = "src/data/information.md"  # Assuming it's in the data folder
formulations_text = parse_markdown(md_file)

# Split the text into meaningful chunks (e.g., per ingredient or section)
# Here we'll simply use each line as a separate chunk
formulations_lines = formulations_text.split("\n")

processed_data = []

# Create embeddings for each formulation line
for idx, line in enumerate(formulations_lines):
    # Only process non-empty lines
    if line.strip():
        response = client.embeddings.create(
            input=line.strip(), model="text-embedding-3-small"
        )
        embedding = response.data[0].embedding
        processed_data.append(
            {
                "values": embedding,
                "id": f"formulation_{idx}",  # Unique ID for each line
                "metadata": {
                    "formulation": line.strip()
                }
            }
        )

# Insert the embeddings into the Pinecone index
index = pc.Index("cropai")  # Use your existing index name
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="formulations_namespace",  # Use a relevant namespace
)
print(f"Upserted count: {upsert_response['upserted_count']}")

# Print index statistics
print(index.describe_index_stats())
