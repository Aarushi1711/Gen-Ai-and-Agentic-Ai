"""
app/core/rag/embeddings.py

Shared embedding model loader. Both engineering_rag.py and (later)
repository_rag.py use this so the model is only loaded once and both
RAG systems stay consistent.
"""

<<<<<<< HEAD
from langchain_community.embeddings import HuggingFaceEmbeddings

=======
from langchain_huggingface import HuggingFaceEmbeddings
>>>>>>> 46d9e9c61d660e3c392a406247c8bb67566f99da
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

_embeddings = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embeddings