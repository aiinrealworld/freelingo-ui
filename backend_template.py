"""
FastAPI Backend Template for FreeLingo
Integrate this with your existing services (DB, LLM)
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

# Import your existing services here
# from api.services.db import DatabaseService
# from api.services.llm import LLMService

app = FastAPI(title="FreeLingo API", version="1.0.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class WordCreate(BaseModel):
    word: str
    translation: str
    example: Optional[str] = None

class WordResponse(WordCreate):
    id: str
    user_id: str
    learned: bool = False
    created_at: datetime

class WordUpdate(BaseModel):
    word: Optional[str] = None
    translation: Optional[str] = None
    example: Optional[str] = None

class DialogueMessage(BaseModel):
    message: str
    user_id: str

class DialogueResponse(BaseModel):
    response: str
    suggested_words: List[str] = []

class UserProgress(BaseModel):
    total_words: int
    learned_words: int
    dialogue_sessions: int
    streak_days: int

# Mock data storage (replace with your Supabase integration)
words_db = {}
user_progress = {}

# Initialize your services here
# db_service = DatabaseService()
# llm_service = LLMService()

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/words/{user_id}", response_model=List[WordResponse])
async def get_user_words(user_id: str):
    """Get all words for a user"""
    try:
        # Replace with your DB service call
        # words = await db_service.get_user_words(user_id)
        
        # Mock implementation
        user_words = words_db.get(user_id, [])
        return user_words
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch words: {str(e)}")

@app.post("/api/words", response_model=WordResponse)
async def create_word(word: WordCreate, user_id: str):
    """Add a new word for a user"""
    try:
        # Replace with your DB service call
        # new_word = await db_service.create_word(word, user_id)
        
        # Mock implementation
        new_word = WordResponse(
            id=str(uuid.uuid4()),
            user_id=user_id,
            word=word.word,
            translation=word.translation,
            example=word.example,
            learned=False,
            created_at=datetime.now()
        )
        
        if user_id not in words_db:
            words_db[user_id] = []
        words_db[user_id].append(new_word)
        
        return new_word
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create word: {str(e)}")

@app.put("/api/words/{word_id}", response_model=WordResponse)
async def update_word(word_id: str, updates: WordUpdate):
    """Update a word"""
    try:
        # Replace with your DB service call
        # updated_word = await db_service.update_word(word_id, updates)
        
        # Mock implementation
        for user_words in words_db.values():
            for word in user_words:
                if word.id == word_id:
                    if updates.word is not None:
                        word.word = updates.word
                    if updates.translation is not None:
                        word.translation = updates.translation
                    if updates.example is not None:
                        word.example = updates.example
                    return word
        
        raise HTTPException(status_code=404, detail="Word not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update word: {str(e)}")

@app.put("/api/words/{word_id}/learned", response_model=WordResponse)
async def mark_word_learned(word_id: str):
    """Mark a word as learned"""
    try:
        # Replace with your DB service call
        # updated_word = await db_service.mark_word_learned(word_id)
        
        # Mock implementation
        for user_words in words_db.values():
            for word in user_words:
                if word.id == word_id:
                    word.learned = True
                    return word
        
        raise HTTPException(status_code=404, detail="Word not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark word as learned: {str(e)}")

@app.delete("/api/words/{word_id}")
async def delete_word(word_id: str):
    """Delete a word"""
    try:
        # Replace with your DB service call
        # await db_service.delete_word(word_id)
        
        # Mock implementation
        for user_id, user_words in words_db.items():
            for i, word in enumerate(user_words):
                if word.id == word_id:
                    words_db[user_id].pop(i)
                    return {"message": "Word deleted successfully"}
        
        raise HTTPException(status_code=404, detail="Word not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete word: {str(e)}")

@app.post("/api/dialogue", response_model=DialogueResponse)
async def chat_with_ai(message: DialogueMessage):
    """Send message to AI tutor"""
    try:
        # Replace with your LLM service call
        # response = await llm_service.chat(message.message, message.user_id)
        
        # Mock implementation
        mock_responses = [
            "Très bien! Votre français s'améliore beaucoup.",
            "Excellente réponse! Continuez comme ça.",
            "Je comprends. Pouvez-vous me dire plus sur cela?",
            "Parfait! Maintenant, essayons une phrase plus complexe.",
            "Bravo! Vous utilisez bien les mots que nous avons appris."
        ]
        
        import random
        response = random.choice(mock_responses)
        
        return DialogueResponse(
            response=response,
            suggested_words=["bonjour", "merci", "au revoir"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")

@app.get("/api/user/{user_id}/progress", response_model=UserProgress)
async def get_user_progress(user_id: str):
    """Get user learning progress"""
    try:
        # Replace with your DB service call
        # progress = await db_service.get_user_progress(user_id)
        
        # Mock implementation
        user_words = words_db.get(user_id, [])
        total_words = len(user_words)
        learned_words = len([w for w in user_words if w.learned])
        
        return UserProgress(
            total_words=total_words,
            learned_words=learned_words,
            dialogue_sessions=user_progress.get(user_id, {}).get("dialogue_sessions", 0),
            streak_days=user_progress.get(user_id, {}).get("streak_days", 0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 