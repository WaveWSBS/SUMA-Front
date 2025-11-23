from .db import Base, engine, SessionLocal
from . import models
from .security import hash_password


def init_db():
    # 在 SQLite 中，如果資料庫檔案不存在，`create_all` 會建立它
    # 如果存在，`create_all` 不會重複建立已有的資料表
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # 檢查是否已有使用者，如果有了，就跳過資料填充
    if db.query(models.User).first():
        db.close()
        return

    print("Database is empty, populating with dummy data...")

    # --- 建立模擬使用者 ---
    users_data = [
        {"email": "admin@example.com", "password": "adminpassword"},
        {"email": "teacher@example.com", "password": "teacherpassword"},
        {"email": "student1@example.com", "password": "studentpassword"},
        {"email": "student2@example.com", "password": "studentpassword"},
    ]

    for user_data in users_data:
        user = models.User(
            email=user_data["email"],
            password_hash=hash_password(user_data["password"])
        )
        db.add(user)
    
    # --- 建立模擬作業分析 ---
    # 注意：tags, plan, challenges 在資料庫中是 Text 類型，但在 Pydantic 模型中是 List[str]。
    # 這裡我們用 JSON 字串的形式儲存，在讀取時需要進行解析。
    analysis1 = models.AssignmentAnalysis(
        source_name="Midterm-Exam.pdf",
        difficulty=4,
        content_summary="這是一份關於化學反應和熱力學的期中考試摘要。",
        estimated_time="1.5 小時",
        challenges='["理解化學平衡的計算", "掌握熱力學第一定律的應用"]',
        plan='["複習課本第五章的化學平衡部分", "完成書後練習題 5.1-5.15"]',
        tags='["期中考", "化學", "熱力學"]',
        rag_summary='{"key_concepts": ["Le Chatelier\'s principle", "Enthalpy", "Entropy"]}',
        ai_comment="學生需要加強複雜計算題的解題速度和準確性。"
    )
    db.add(analysis1)

    analysis2 = models.AssignmentAnalysis(
        source_name="Redox Homework 1.pdf",
        difficulty=3,
        content_summary="這是一份關於氧化還原反應的作業,涵蓋氧化態判定、半反應平衡和完整氧化還原方程式配平。",
        estimated_time="2 小時",
        challenges='["判定複雜分子中的氧化態", "在酸性和鹼性環境中平衡半反應", "識別氧化劑和還原劑"]',
        plan='["複習課本中氧化還原反應章節", "練習半反應法配平", "完成所有習題並檢查答案"]',
        tags='["氧化還原", "化學", "作業", "High Occurrence in tests"]',
        rag_summary='{"key_concepts": ["Oxidation numbers", "Half-reaction method", "Redox balancing", "Oxidizing and reducing agents"]}',
        ai_comment="這個作業重點在於掌握氧化還原反應的配平技巧,建議學生多練習不同環境(酸性/鹼性)下的配平方法。"
    )
    db.add(analysis2)

    try:
        db.commit()
        print("Dummy data has been inserted successfully.")
    except Exception as e:
        print(f"An error occurred while inserting dummy data: {e}")
        db.rollback()
    finally:
        db.close()
