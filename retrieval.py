from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
import numpy as np
from database import MarketingContent
from embeddings import get_embedding_generator
from config import get_settings
from pydantic import BaseModel

settings = get_settings()


class ContentFilter(BaseModel):
    content_type: Optional[str] = None
    campaign_name: Optional[str] = None
    audience: Optional[str] = None
    compliance_status: Optional[str] = "approved"
    tags: Optional[List[str]] = None


class RetrievedContent(BaseModel):
    id: int
    title: str
    content: str
    content_type: str
    campaign_name: Optional[str]
    audience: Optional[str]
    compliance_status: str
    source: Optional[str]
    tags: Optional[str]
    similarity_score: float
    
    class Config:
        from_attributes = True


def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))


class ContentRetriever:
    def __init__(self):
        self.embedding_generator = get_embedding_generator()
    
    def retrieve(self, db: Session, query: str, filters: Optional[ContentFilter] = None, top_k: int = None) -> List[RetrievedContent]:
        if top_k is None:
            top_k = settings.TOP_K_RESULTS
        
        query_embedding = self.embedding_generator.generate_embedding(query)
        
        db_query = db.query(MarketingContent).filter(MarketingContent.is_active == True)
        
        if filters:
            if filters.content_type:
                db_query = db_query.filter(MarketingContent.content_type == filters.content_type)
            if filters.campaign_name:
                db_query = db_query.filter(MarketingContent.campaign_name.ilike(f"%{filters.campaign_name}%"))
            if filters.audience:
                db_query = db_query.filter(MarketingContent.audience == filters.audience)
            if filters.compliance_status:
                db_query = db_query.filter(MarketingContent.compliance_status == filters.compliance_status)
            if filters.tags:
                tag_filters = [MarketingContent.tags.ilike(f"%{tag}%") for tag in filters.tags]
                db_query = db_query.filter(or_(*tag_filters))
        
        all_content = db_query.all()
        
        scored_content = []
        for content in all_content:
            similarity = cosine_similarity(query_embedding, content.embedding)
            
            if similarity >= settings.SIMILARITY_THRESHOLD:
                scored_content.append({
                    'content': content,
                    'similarity': similarity
                })
        
        scored_content.sort(key=lambda x: x['similarity'], reverse=True)
        top_results = scored_content[:top_k]
        
        retrieved_content = []
        for item in top_results:
            content = item['content']
            retrieved_content.append(
                RetrievedContent(
                    id=content.id,
                    title=content.title,
                    content=content.content,
                    content_type=content.content_type,
                    campaign_name=content.campaign_name,
                    audience=content.audience,
                    compliance_status=content.compliance_status,
                    source=content.source,
                    tags=content.tags,
                    similarity_score=round(item['similarity'], 4)
                )
            )
        
        return retrieved_content
    
    def retrieve_by_id(self, db: Session, content_id: int) -> Optional[RetrievedContent]:
        content = db.query(MarketingContent).filter(MarketingContent.id == content_id).first()
        
        if content:
            return RetrievedContent(
                id=content.id,
                title=content.title,
                content=content.content,
                content_type=content.content_type,
                campaign_name=content.campaign_name,
                audience=content.audience,
                compliance_status=content.compliance_status,
                source=content.source,
                tags=content.tags,
                similarity_score=1.0
            )
        return None
    
    def get_all_content(self, db: Session, skip: int = 0, limit: int = 100) -> List[RetrievedContent]:
        contents = db.query(MarketingContent).filter(MarketingContent.is_active == True).offset(skip).limit(limit).all()
        
        return [
            RetrievedContent(
                id=content.id,
                title=content.title,
                content=content.content,
                content_type=content.content_type,
                campaign_name=content.campaign_name,
                audience=content.audience,
                compliance_status=content.compliance_status,
                source=content.source,
                tags=content.tags,
                similarity_score=0.0
            )
            for content in contents
        ]


_retriever = None

def get_retriever() -> ContentRetriever:
    global _retriever
    if _retriever is None:
        _retriever = ContentRetriever()
    return _retriever
