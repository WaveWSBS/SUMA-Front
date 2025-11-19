from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.responses import JSONResponse
from openai import OpenAI
import PyPDF2
import io
import os
import uuid
import re
from dotenv import load_dotenv
from typing import Dict, List, Optional
from model import init_db, save_analysis, get_analysis, get_all_analyses
from RAG_textbook.rag_system import TextbookRAG, load_quiz_from_pdf

# Load environment variables
load_dotenv()

# Initialize database
init_db()

# Initialize FastAPI app
app = FastAPI(title="Assignment Analyzer API", version="1.0.0")

# Initialize OpenAI client (require key from environment)
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError("OPENAI_API_KEY environment variable is not set.")
client = OpenAI(api_key=openai_api_key)

# Initialize RAG system (lazy loading)
rag_system = None

def get_rag_system():
    """Get or initialize RAG system."""
    global rag_system
    if rag_system is None:
      rag_system = TextbookRAG(openai_api_key=openai_api_key)
      try:
          rag_system.build_vectorstore(force_rebuild=False)
      except Exception as e:
          print(f"Warning: Could not load RAG system: {str(e)}")
          rag_system = None
    return rag_system

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError("OPENAI_API_KEY environment variable is not set.")
client = OpenAI(api_key=openai_api_key)



def extract_text_from_pdf(pdf_file: bytes) -> str:
    """
    Extract text content from PDF file bytes.
    
    Args:
        pdf_file: PDF file as bytes
        
    Returns:
        Extracted text content as string
    """
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")


def parse_time_to_hours(time_str: str) -> float:
    """
    Parse time string to hours.
    Examples: "2-3 hours" -> 2.5, "1 week" -> 40, "30 minutes" -> 0.5
    
    Args:
        time_str: Time string from analysis
        
    Returns:
        Estimated hours as float
    """
    time_str = time_str.lower()
    
    # Extract numbers
    numbers = re.findall(r'\d+\.?\d*', time_str)
    if not numbers:
        return 0
    
    # Check for week
    if 'week' in time_str:
        weeks = float(numbers[0])
        if len(numbers) > 1:
            weeks = (float(numbers[0]) + float(numbers[1])) / 2
        return weeks * 40  # Assume 40 hours per week
    
    # Check for day
    if 'day' in time_str:
        days = float(numbers[0])
        if len(numbers) > 1:
            days = (float(numbers[0]) + float(numbers[1])) / 2
        return days * 8  # Assume 8 hours per day
    
    # Check for hour
    if 'hour' in time_str:
        hours = float(numbers[0])
        if len(numbers) > 1:
            hours = (float(numbers[0]) + float(numbers[1])) / 2
        return hours
    
    # Check for minute
    if 'minute' in time_str:
        minutes = float(numbers[0])
        return minutes / 60
    
    # Default: assume hours if number found
    return float(numbers[0])


def generate_tags(analysis: Dict) -> List[str]:
    """
    Generate tags based on analysis results.
    
    Tag rules:
    - "Time Consuming": estimated_time > 10 hours
    - "High Occurrence in tests": content mentions test/exam/quiz
    - "Practice Recommended": difficulty >= 7
    - "Quick Task": estimated_time < 2 hours
    - "Complex": difficulty >= 8 or challenges count >= 4
    - "Group Work Suggested": content mentions group/team/collaboration
    
    Args:
        analysis: Dictionary containing analysis results
        
    Returns:
        List of tag strings
    """
    tags = []
    
    # Parse estimated time
    estimated_time = analysis.get("estimated_time", "")
    time_hours = parse_time_to_hours(estimated_time)
    
    # Time Consuming: > 10 hours
    if time_hours > 10:
        tags.append("Time Consuming")
    
    # Quick Task: < 2 hours
    if time_hours > 0 and time_hours < 2:
        tags.append("Quick Task")
    
    # High Occurrence in tests: check content for test-related keywords
    content_lower = analysis.get("content_summary", "").lower()
    test_keywords = ["test", "exam", "quiz", "assessment", "evaluation", "midterm", "final"]
    if any(keyword in content_lower for keyword in test_keywords):
        tags.append("High Occurrence in tests")
    
    # Practice Recommended: difficulty >= 7
    difficulty = analysis.get("difficulty", 0)
    if difficulty >= 7:
        tags.append("Practice Recommended")
    
    # Complex: difficulty >= 8 or many challenges
    challenges = analysis.get("challenges", [])
    if difficulty >= 8 or len(challenges) >= 4:
        tags.append("Complex")
    
    # Group Work Suggested: check content for collaboration keywords
    collaboration_keywords = ["group", "team", "collaboration", "partner", "together", "pair"]
    if any(keyword in content_lower for keyword in collaboration_keywords):
        tags.append("Group Work Suggested")
    
    return tags


def analyze_assignment(pdf_text: str) -> Dict:
    """
    Analyze assignment PDF using OpenAI and extract key information.
    
    Args:
        pdf_text: Text content extracted from PDF
        
    Returns:
        Dictionary containing analysis results
    """
    prompt = f"""Please analyze the following assignment document and extract key information. 
Return a structured analysis in JSON format with the following fields:
- difficulty: A rating from 1-10 (1 being very easy, 10 being very difficult)
- content_summary: A brief summary of what the assignment is about
- estimated_time: Estimated time needed to complete (e.g., "2-3 hours", "1 week")
- challenges: List of main challenges or difficult aspects
- plan: A simple step-by-step plan to complete the assignment

Assignment content:
{pdf_text}

Please respond with only valid JSON in this format:
{{
    "difficulty": <number>,
    "content_summary": "<text>",
    "estimated_time": "<text>",
    "challenges": ["<challenge1>", "<challenge2>", ...],
    "plan": ["<step1>", "<step2>", ...]
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert at analyzing academic assignments and providing structured summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing assignment: {str(e)}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Assignment Analyzer API is running"}


@app.post("/analyze-assignment")
async def analyze_assignment_endpoint(file: UploadFile = File(...)):
    """
    Analyze an assignment PDF file and extract key information.
    
    Args:
        file: PDF file upload
        
    Returns:
        JSON response with analysis results including:
        - taskid: Unique task identifier
        - difficulty: Difficulty rating (1-10)
        - content_summary: Summary of assignment content
        - estimated_time: Estimated completion time
        - challenges: List of main challenges
        - plan: Step-by-step completion plan
    """
    # Check if file is PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Read PDF file
    pdf_bytes = await file.read()
    
    # Extract text from PDF
    pdf_text = extract_text_from_pdf(pdf_bytes)
    
    if not pdf_text.strip():
        raise HTTPException(status_code=400, detail="PDF appears to be empty or could not extract text")
    
    # Analyze assignment using OpenAI
    analysis = analyze_assignment(pdf_text)
    
    # Generate tags based on analysis
    tags = generate_tags(analysis)
    
    # Check high occurrence in tests using RAG if available
    rag = get_rag_system()
    if rag:
        try:
            occurrence_check = rag.check_high_occurrence_in_tests(pdf_text)
            if occurrence_check.get("is_high_occurrence", False):
                if "High Occurrence in tests" not in tags:
                    tags.append("High Occurrence in tests")
        except Exception as e:
            print(f"Error checking high occurrence: {str(e)}")
    
    analysis["tags"] = tags
    
    # Generate unique taskid
    taskid = str(uuid.uuid4())
    
    # Save to database
    save_analysis(taskid, analysis)
    
    # Add taskid to response
    analysis["taskid"] = taskid
    
    return JSONResponse(content=analysis)


@app.get("/analysis/{taskid}")
async def get_analysis_by_id(taskid: str):
    """
    Retrieve analysis results by taskid.
    
    Args:
        taskid: Unique task identifier
        
    Returns:
        JSON response with analysis results
    """
    analysis = get_analysis(taskid)
    
    if analysis is None:
        raise HTTPException(status_code=404, detail=f"Analysis with taskid {taskid} not found")
    
    return JSONResponse(content=analysis)


@app.post("/rag/check-high-occurrence")
async def check_high_occurrence_endpoint(
    taskid: Optional[str] = Body(None),
    assignment_content: Optional[str] = Body(None)
):
    """
    Check if assignment has high occurrence in tests using RAG system.
    
    Args:
        taskid: Optional task ID to retrieve assignment content
        assignment_content: Optional direct assignment content
        
    Returns:
        JSON with high occurrence analysis
    """
    rag = get_rag_system()
    if rag is None:
        raise HTTPException(status_code=503, detail="RAG system not available. Please build vector store first.")
    
    # Get assignment content
    content = assignment_content
    if taskid and not content:
        analysis = get_analysis(taskid)
        if analysis:
            content = analysis.get("content_summary", "")
    
    if not content:
        raise HTTPException(status_code=400, detail="Either taskid or assignment_content must be provided")
    
    # Check high occurrence
    result = rag.check_high_occurrence_in_tests(content)
    
    return JSONResponse(content=result)


@app.post("/rag/query")
async def rag_query_endpoint(question: str = Body(..., embed=True)):
    """
    Query the RAG system with a question about textbook content.
    
    Args:
        question: Question to ask about textbook
        
    Returns:
        JSON with answer and source documents
    """
    rag = get_rag_system()
    if rag is None:
        raise HTTPException(status_code=503, detail="RAG system not available. Please build vector store first.")
    
    result = rag.query(question)
    return JSONResponse(content=result)


@app.post("/rag/search")
async def rag_search_endpoint(query: str = Body(..., embed=True), k: int = Body(5)):
    """
    Search for similar content in textbooks.
    
    Args:
        query: Search query
        k: Number of results (default 5)
        
    Returns:
        JSON with similar content chunks
    """
    rag = get_rag_system()
    if rag is None:
        raise HTTPException(status_code=503, detail="RAG system not available. Please build vector store first.")
    
    results = rag.search_similar_content(query, k=k)
    return JSONResponse(content={"results": results, "count": len(results)})


@app.post("/rag/analyze-quiz")
async def analyze_quiz_endpoint(file: UploadFile = File(...)):
    """
    Analyze a quiz PDF to check topic coverage in textbook.
    
    Args:
        file: Quiz PDF file
        
    Returns:
        JSON with quiz analysis including topic coverage
    """
    rag = get_rag_system()
    if rag is None:
        raise HTTPException(status_code=503, detail="RAG system not available. Please build vector store first.")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Read PDF
    pdf_bytes = await file.read()
    pdf_text = extract_text_from_pdf(pdf_bytes)
    
    if not pdf_text.strip():
        raise HTTPException(status_code=400, detail="PDF appears to be empty")
    
    # Analyze quiz
    analysis = rag.analyze_quiz(pdf_text)
    
    return JSONResponse(content=analysis)


@app.post("/rag/build-vectorstore")
async def build_vectorstore_endpoint(data: Dict = Body(default={"force_rebuild": False})):
    """
    Build or rebuild the vector store from textbooks.
    
    Note: This process can take 5-15 minutes for large PDF files.
    The request will appear to hang, but it's actually processing.
    Check server logs for progress updates.
    
    Args:
        data: JSON body with optional "force_rebuild" boolean
        
    Returns:
        JSON with build status
    """
    import asyncio
    
    try:
        force_rebuild = data.get("force_rebuild", False)
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        rag = TextbookRAG(openai_api_key=openai_api_key)
        
        # Run the blocking operation in executor
        await loop.run_in_executor(
            None, 
            rag.build_vectorstore, 
            force_rebuild
        )
        
        # Update global RAG system
        global rag_system
        rag_system = rag
        
        return JSONResponse(content={
            "status": "success",
            "message": "Vector store built successfully"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error building vector store: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
