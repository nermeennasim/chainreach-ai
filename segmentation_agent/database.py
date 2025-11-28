"""
Database models and connection management for Segmentation Agent
"""
import os
from sqlalchemy import create_engine, Column, Float, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

Base = declarative_base()

class CustomerRFM(Base):
    """
    Customer RFM (Recency, Frequency, Monetary) table
    """
    __tablename__ = 'customer_rfm'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Float, unique=True, nullable=False, index=True)
    recency = Column(Float, nullable=False)
    frequency = Column(Float, nullable=False)
    monetary = Column(Float, nullable=False)
    
    def __repr__(self):
        return f"<CustomerRFM(customer_id={self.customer_id}, R={self.recency}, F={self.frequency}, M={self.monetary})>"


# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/chainreach_dev")

try:
    engine = create_engine(DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Test connection
    with engine.connect() as conn:
        print(f"✅ Database connected: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'localhost'}")
    
    db_available = True
except Exception as e:
    print(f"⚠️ Database connection failed: {e}")
    print("📁 Falling back to CSV file")
    engine = None
    SessionLocal = None
    db_available = False


def init_db():
    """Create all tables in the database"""
    if db_available and engine:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
    else:
        print("⚠️ Database not available, skipping table creation")


def get_db():
    """Get database session"""
    if not db_available or not SessionLocal:
        return None
    
    db = SessionLocal()
    try:
        return db
    except:
        db.close()
        return None
