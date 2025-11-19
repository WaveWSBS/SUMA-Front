# Assignment Analyzer API

A simple FastAPI backend for analyzing assignment PDFs using OpenAI.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. The OpenAI API key is already in the code. 
```

## Running the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Health Check
- **GET** `/`
- Returns API status

### 2. Analyze Assignment
- **POST** `/analyze-assignment`
- **Body**: Form data with PDF file
- **Returns**: JSON with analysis including:
  - `taskid`: Unique task identifier (UUID)
  - `difficulty`: Difficulty rating (1-10)
  - `content_summary`: Summary of assignment
  - `estimated_time`: Estimated completion time
  - `challenges`: List of main challenges
  - `plan`: Step-by-step completion plan
- **Note**: Results are automatically saved to SQLite database

### 3. Get Analysis by Task ID
- **GET** `/analysis/{taskid}`
- **Returns**: JSON with analysis results for the specified taskid
- **Example**: `GET /analysis/123e4567-e89b-12d3-a456-426614174000`

## Example Usage

Using curl:
```bash
curl -X POST "http://localhost:8000/analyze-assignment" \
  -F "file=@assignment.pdf"
```

Using Python:
```python
import requests

# Analyze assignment
url = "http://localhost:8000/analyze-assignment"
files = {"file": open("assignment.pdf", "rb")}
response = requests.post(url, files=files)
result = response.json()
print(result)

# Get taskid from response
taskid = result["taskid"]

# Retrieve analysis later by taskid
get_url = f"http://localhost:8000/analysis/{taskid}"
response = requests.get(get_url)
print(response.json())

# Get all analyses
all_url = "http://localhost:8000/analyses"
response = requests.get(all_url)
print(response.json())
```

## Database

The application uses SQLite database (`assignments.db`) to persist analysis results. The database is automatically created on first run. Each analysis is stored with:
- `taskid`: Primary key (UUID)
- `difficulty`: Integer (1-10)
- `content_summary`: Text
- `estimated_time`: Text
- `challenges`: JSON array
- `plan`: JSON array
- `created_at`: Timestamp

