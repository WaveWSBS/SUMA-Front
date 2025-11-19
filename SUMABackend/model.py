import sqlite3
import json
from typing import Dict, Optional
from datetime import datetime
import os

# Database file path
DB_PATH = "assignments.db"


def init_db():
    """
    Initialize the database and create tables if they don't exist.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create assignments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assignments (
            taskid TEXT PRIMARY KEY,
            difficulty INTEGER,
            content_summary TEXT,
            estimated_time TEXT,
            challenges TEXT,
            plan TEXT,
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add tags column if it doesn't exist (for existing databases)
    try:
        cursor.execute("ALTER TABLE assignments ADD COLUMN tags TEXT")
    except sqlite3.OperationalError:
        # Column already exists, ignore
        pass
    
    conn.commit()
    conn.close()


def save_analysis(taskid: str, analysis_data: Dict) -> bool:
    """
    Save analysis results to database.
    
    Args:
        taskid: Unique task identifier
        analysis_data: Dictionary containing analysis results
        
    Returns:
        True if successful, False otherwise
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Convert lists to JSON strings for storage
        challenges_json = json.dumps(analysis_data.get("challenges", []))
        plan_json = json.dumps(analysis_data.get("plan", []))
        tags_json = json.dumps(analysis_data.get("tags", []))
        
        cursor.execute("""
            INSERT OR REPLACE INTO assignments 
            (taskid, difficulty, content_summary, estimated_time, challenges, plan, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            taskid,
            analysis_data.get("difficulty"),
            analysis_data.get("content_summary"),
            analysis_data.get("estimated_time"),
            challenges_json,
            plan_json,
            tags_json
        ))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error saving to database: {str(e)}")
        return False


def get_analysis(taskid: str) -> Optional[Dict]:
    """
    Retrieve analysis results from database by taskid.
    
    Args:
        taskid: Unique task identifier
        
    Returns:
        Dictionary containing analysis results, or None if not found
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT taskid, difficulty, content_summary, estimated_time, challenges, plan, tags, created_at
            FROM assignments
            WHERE taskid = ?
        """, (taskid,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row is None:
            return None
        
        # Convert back to dictionary format
        result = {
            "taskid": row[0],
            "difficulty": row[1],
            "content_summary": row[2],
            "estimated_time": row[3],
            "challenges": json.loads(row[4]) if row[4] else [],
            "plan": json.loads(row[5]) if row[5] else [],
            "tags": json.loads(row[6]) if row[6] else [],
            "created_at": row[7]
        }
        
        return result
    except Exception as e:
        print(f"Error retrieving from database: {str(e)}")
        return None


def get_all_analyses() -> list:
    """
    Retrieve all analysis results from database.
    
    Returns:
        List of dictionaries containing all analysis results
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT taskid, difficulty, content_summary, estimated_time, challenges, plan, tags, created_at
            FROM assignments
            ORDER BY created_at DESC
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            results.append({
                "taskid": row[0],
                "difficulty": row[1],
                "content_summary": row[2],
                "estimated_time": row[3],
                "challenges": json.loads(row[4]) if row[4] else [],
                "plan": json.loads(row[5]) if row[5] else [],
                "tags": json.loads(row[6]) if row[6] else [],
                "created_at": row[7]
            })
        
        return results
    except Exception as e:
        print(f"Error retrieving all from database: {str(e)}")
        return []

