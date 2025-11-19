"""
RAG (Retrieval-Augmented Generation) system for textbook content.
Uses LangChain and Chroma for document processing and retrieval.
"""
import os
import glob
from typing import List, Dict, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.document_loaders import PyPDFLoader
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import PyPDF2
import io


class TextbookRAG:
    """
    RAG system for textbook content retrieval and quiz analysis.
    """
    
    def __init__(self, textbook_dir: str = "RAG_textbook", persist_directory: str = "RAG_textbook/chroma_db", openai_api_key: str = None):
        """
        Initialize RAG system.
        
        Args:
            textbook_dir: Directory containing PDF files
            persist_directory: Directory to persist Chroma vector store
            openai_api_key: OpenAI API key (if None, will try to get from environment)
        """
        self.textbook_dir = textbook_dir
        self.persist_directory = persist_directory
        self.openai_api_key = openai_api_key
        # Initialize embeddings with API key
        if openai_api_key:
            self.embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
        else:
            self.embeddings = OpenAIEmbeddings()
        self.vectorstore = None
        self.qa_chain = None
        
        # Initialize text splitter with optimal chunk size
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=512,
            chunk_overlap=50,
            length_function=len,
        )
    
    def load_textbooks(self) -> List:
        """
        Load all PDF files from textbook directory.
        
        Returns:
            List of Document objects
        """
        pdf_files = glob.glob(os.path.join(self.textbook_dir, "*.pdf"))
        all_documents = []
        
        print(f"Found {len(pdf_files)} PDF files to process")
        
        for idx, pdf_file in enumerate(pdf_files, 1):
            try:
                print(f"[{idx}/{len(pdf_files)}] Loading {os.path.basename(pdf_file)}...")
                loader = PyPDFLoader(pdf_file)
                documents = loader.load()
                # Add metadata about source file
                for doc in documents:
                    doc.metadata["source"] = os.path.basename(pdf_file)
                all_documents.extend(documents)
                print(f"  ✓ Loaded {len(documents)} pages from {os.path.basename(pdf_file)}")
            except Exception as e:
                print(f"  ✗ Error loading {pdf_file}: {str(e)}")
        
        print(f"Total pages loaded: {len(all_documents)}")
        return all_documents
    
    def build_vectorstore(self, force_rebuild: bool = False):
        """
        Build or load vector store from textbooks.
        
        Args:
            force_rebuild: If True, rebuild vector store even if it exists
        """
        if not force_rebuild and os.path.exists(self.persist_directory):
            print("Loading existing vector store...")
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings
            )
            print("Vector store loaded successfully")
        else:
            print("Building new vector store from textbooks...")
            print("This may take several minutes for large PDF files...")
            
            documents = self.load_textbooks()
            
            if not documents:
                raise ValueError("No documents found to process")
            
            # Split documents into chunks
            print("Splitting documents into chunks...")
            texts = self.text_splitter.split_documents(documents)
            print(f"✓ Split into {len(texts)} chunks")
            
            # Create vector store (this is the slow part - generating embeddings)
            print(f"Generating embeddings for {len(texts)} chunks...")
            print("This may take 5-15 minutes depending on the size of your textbooks...")
            print("Please be patient, the process is running...")
            
            self.vectorstore = Chroma.from_documents(
                documents=texts,
                embedding=self.embeddings,
                persist_directory=self.persist_directory
            )
            print("✓ Vector store created and saved successfully!")
    
    def initialize_qa_chain(self, openai_api_key: str = None):
        """
        Initialize QA chain for question answering.
        
        Args:
            openai_api_key: OpenAI API key (optional, uses instance key if not provided)
        """
        if self.vectorstore is None:
            self.build_vectorstore()
        
        # Use provided key or instance key
        api_key = openai_api_key or self.openai_api_key
        
        # Create retriever
        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}  # Retrieve top 5 relevant chunks
        )
        
        # Create prompt template
        prompt_template = """Use the following pieces of context from the textbook to answer the question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Question: {question}

Answer:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Initialize LLM with API key
        if api_key:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=api_key)
        else:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        
        # Create QA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=True
        )
    
    def query(self, question: str, openai_api_key: str = None) -> Dict:
        """
        Query the RAG system with a question.
        
        Args:
            question: Question to ask
            openai_api_key: OpenAI API key (optional, uses instance key if not provided)
            
        Returns:
            Dictionary with answer and source documents
        """
        if self.qa_chain is None:
            self.initialize_qa_chain(openai_api_key=openai_api_key or self.openai_api_key)
        
        result = self.qa_chain({"query": question})
        return {
            "answer": result["result"],
            "sources": [
                {
                    "content": doc.page_content[:200] + "...",
                    "source": doc.metadata.get("source", "unknown"),
                    "page": doc.metadata.get("page", "unknown")
                }
                for doc in result["source_documents"]
            ]
        }
    
    def search_similar_content(self, query: str, k: int = 5) -> List[Dict]:
        """
        Search for similar content in textbooks.
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of similar content chunks
        """
        if self.vectorstore is None:
            self.build_vectorstore()
        
        # Search for similar documents
        docs = self.vectorstore.similarity_search(query, k=k)
        
        results = []
        for doc in docs:
            results.append({
                "content": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
                "page": doc.metadata.get("page", "unknown"),
                "score": None  # Chroma doesn't return scores by default
            })
        
        return results
    
    def analyze_quiz(self, quiz_text: str) -> Dict:
        """
        Analyze a quiz to extract topics and check if they appear in textbook.
        
        Args:
            quiz_text: Text content of the quiz
            
        Returns:
            Dictionary with analysis results
        """
        if self.vectorstore is None:
            self.build_vectorstore()
        
        # Search for quiz topics in textbook
        similar_content = self.search_similar_content(quiz_text, k=10)
        
        # Analyze coverage
        topics_found = len(similar_content) > 0
        coverage_score = min(len(similar_content) / 10.0, 1.0) if similar_content else 0.0
        
        return {
            "topics_found": topics_found,
            "coverage_score": coverage_score,
            "relevant_sections": similar_content[:5],  # Top 5 most relevant
            "total_matches": len(similar_content)
        }
    
    def check_high_occurrence_in_tests(self, assignment_content: str, quiz_texts: List[str] = None) -> Dict:
        """
        Check if assignment content has high occurrence in tests.
        
        Args:
            assignment_content: Content of the assignment
            quiz_texts: Optional list of quiz texts to compare against
            
        Returns:
            Dictionary with analysis including is_high_occurrence flag
        """
        if self.vectorstore is None:
            self.build_vectorstore()
        
        # Search for assignment topics in textbook
        assignment_matches = self.search_similar_content(assignment_content, k=10)
        
        # If quiz texts provided, check similarity with quizzes
        quiz_similarity = 0.0
        if quiz_texts:
            total_similarity = 0.0
            for quiz_text in quiz_texts:
                quiz_matches = self.search_similar_content(quiz_text, k=5)
                # Simple similarity: check if assignment topics appear in quiz matches
                assignment_topics = set(assignment_content.lower().split())
                for match in quiz_matches:
                    match_words = set(match["content"].lower().split())
                    if assignment_topics.intersection(match_words):
                        total_similarity += 1.0
                        break
            quiz_similarity = total_similarity / len(quiz_texts) if quiz_texts else 0.0
        
        # Determine if high occurrence
        # Criteria: good textbook coverage AND (quiz similarity > 0.5 if quizzes provided)
        has_textbook_coverage = len(assignment_matches) >= 5
        is_high_occurrence = has_textbook_coverage
        
        if quiz_texts:
            is_high_occurrence = has_textbook_coverage and quiz_similarity > 0.5
        
        return {
            "is_high_occurrence": is_high_occurrence,
            "textbook_coverage": {
                "matches_found": len(assignment_matches),
                "relevant_sections": assignment_matches[:5]
            },
            "quiz_similarity": quiz_similarity if quiz_texts else None,
            "confidence": min(len(assignment_matches) / 10.0, 1.0)
        }


def load_quiz_from_pdf(pdf_path: str) -> str:
    """
    Load quiz content from PDF file.
    
    Args:
        pdf_path: Path to quiz PDF
        
    Returns:
        Extracted text content
    """
    try:
        with open(pdf_path, "rb") as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"Error loading quiz PDF: {str(e)}")
        return ""

