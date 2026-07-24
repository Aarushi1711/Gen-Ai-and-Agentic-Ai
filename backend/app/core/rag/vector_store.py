"""
app/core/rag/vector_store.py

Lightweight, in-memory TF-IDF vector store.

Why this replaces sentence-transformers too (not just ChromaDB): torch
+ a neural embedding model need several hundred MB of RAM just to
load. On Render's free tier (512MB total), that's very likely what
was causing 502s on almost every route -- even after ChromaDB was
removed -- since /health doesn't touch the model but any real request
(auth, chat, upload) does.

TF-IDF is a classic, non-neural way to turn text into vectors -- pure
scikit-learn, a few MB instead of hundreds. It matches on word/keyword
overlap rather than deep semantic meaning, so it's a real trade-off in
retrieval quality -- but for finding relevant code files or doc chunks,
it's a reasonable one, especially versus "crashes before it can answer
anything."

Same shape as before (similarity_search / similarity_search_with_
relevance_scores returning Document-like objects), so retrieve_*()
functions in engineering_rag.py / repository_rag.py barely change,
and generate.py / report_generator.py don't change at all.
"""

from dataclasses import dataclass, field
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@dataclass
class Document:
    """Minimal stand-in for langchain's Document -- just page_content
    and metadata, which is all retrieve_*() functions actually read."""
    page_content: str
    metadata: dict = field(default_factory=dict)


class TfidfVectorStore:
    def __init__(self):
        self._texts: list[str] = []
        self._metadatas: list[dict] = []
        self._vectorizer: TfidfVectorizer | None = None
        self._matrix = None

    def add_texts(self, texts: list[str], metadatas: list[dict] | None = None):
        if not texts:
            return
        metadatas = metadatas or [{} for _ in texts]
        self._texts.extend(texts)
        self._metadatas.extend(metadatas)
        self._refit()

    def _refit(self):
        # Refitting from scratch on every add is cheap at these corpus
        # sizes (one repo / one knowledge base at a time) and keeps
        # this simple -- no incremental-vocabulary bookkeeping needed.
        self._vectorizer = TfidfVectorizer(stop_words="english", max_features=20000)
        self._matrix = self._vectorizer.fit_transform(self._texts)

    def _scored_search(self, query: str, k: int) -> list[tuple[int, float]]:
        if self._vectorizer is None or len(self._texts) == 0:
            return []

        query_vec = self._vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self._matrix)[0]

        k = min(k, len(self._texts))
        top_indices = np.argsort(sims)[::-1][:k]
        return [(int(i), float(sims[i])) for i in top_indices]

    def similarity_search(self, query: str, k: int = 4) -> list[Document]:
        results = self._scored_search(query, k)
        return [
            Document(page_content=self._texts[i], metadata=self._metadatas[i])
            for i, _ in results
        ]

    def similarity_search_with_relevance_scores(
        self, query: str, k: int = 4
    ) -> list[tuple[Document, float]]:
        results = self._scored_search(query, k)
        return [
            (Document(page_content=self._texts[i], metadata=self._metadatas[i]), score)
            for i, score in results
        ]

    def __len__(self) -> int:
        return len(self._texts)