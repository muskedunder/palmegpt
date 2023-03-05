import json
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client
from tqdm import tqdm

load_dotenv(Path.cwd() / ".env.local")

supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

embeddings_dir = Path(os.getenv("EMBEDDINGS_LOCAL_PATH"))
embedding_dim = 1536

fpaths = list(embeddings_dir.iterdir())


for fpath in tqdm(fpaths, total=len(fpaths), desc="adding embeddings to faiss index"):

    if fpath.suffix == ".json":

        data = json.load(open(fpath))

        try:
            response = supabase.table('documents').select("id").eq("id", data["text_hash"]).execute()
        except Exception as exc:
            print(f"failed to check if {data['text_hash']} is already in db, moving to next doc. Error: {exc}")
            continue

        if len(response.data) == 0:

            formated_data = {
                "id": data["text_hash"],
                "content": data["text"],
                "embedding": data["embedding"],
                "model_provider": "openai",
                "model_id": "text-embedding-ada-002",
                "pdf_id": data["pdf_id"],
                "split_id": str(data["_split_id"]),
                "n_tokens": data["n_tokens"],
            }

            try:
                data, count = supabase.table('documents').insert(formated_data).execute()
            except Exception as exc:
                print(f"failed to upload {data['text_hash']} to db, moving to next doc. Error: {exc}")
                continue
