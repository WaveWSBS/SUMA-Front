# RAG Textbook System

This module implements a Retrieval-Augmented Generation (RAG) system for analyzing textbook content and determining if assignments have high occurrence in tests.

## Features

- **Document Processing**: Loads and processes PDF textbooks
- **Vector Store**: Uses Chroma for efficient similarity search
- **Question Answering**: Query textbook content with questions
- **Quiz Analysis**: Analyze quiz PDFs to check topic coverage
- **High Occurrence Detection**: Determine if assignments appear frequently in tests

## Setup

1. Install dependencies:
```bash
pip install -r ../requirements.txt
```

2. Build the vector store (first time):
```bash
# Via API endpoint
curl -X POST "http://localhost:8000/rag/build-vectorstore" \
  -H "Content-Type: application/json" \
  -d '{"force_rebuild": false}'
```

Or in Python:
```python
from RAG_textbook.rag_system import TextbookRAG

rag = TextbookRAG()
rag.build_vectorstore(force_rebuild=False)
```

## Usage

### Check High Occurrence in Tests

```python
from RAG_textbook.rag_system import TextbookRAG

rag = TextbookRAG()
rag.build_vectorstore()

# Check if assignment has high occurrence
result = rag.check_high_occurrence_in_tests(assignment_content)
print(result["is_high_occurrence"])
```

### Query Textbook

```python
# Ask questions about textbook content
result = rag.query("What is machine learning?")
print(result["answer"])
```

### Analyze Quiz

```python
# Analyze quiz coverage
quiz_text = load_quiz_from_pdf("quiz.pdf")
analysis = rag.analyze_quiz(quiz_text)
print(f"Coverage score: {analysis['coverage_score']}")
```

## API Endpoints

- `POST /rag/build-vectorstore` - Build vector store from textbooks
- `POST /rag/query` - Query textbook with questions
- `POST /rag/search` - Search for similar content
- `POST /rag/analyze-quiz` - Analyze quiz PDF
- `POST /rag/check-high-occurrence` - Check if assignment is high occurrence

## Best Practices

1. **Chunk Size**: 512 characters with 50 character overlap (optimal for most cases)
2. **Retrieval**: Top 5 most similar chunks (k=5)
3. **Embeddings**: OpenAI embeddings for best quality
4. **Vector Store**: Chroma for lightweight, persistent storage

