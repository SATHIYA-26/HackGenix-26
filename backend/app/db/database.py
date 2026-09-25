from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

# Create engine
database_url = settings.DATABASE_URL

# Configure engine arguments depending on DB type
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    database_url,
    echo=settings.DB_ECHO,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(check_vector: bool = True) -> None:
    """Initialize database tables and extensions (e.g. pgvector for PostgreSQL)."""
    try:
        if "postgresql" in settings.DATABASE_URL and check_vector:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                logger.info("PostgreSQL pgvector extension verified/created.")
    except Exception as exc:
        logger.warning(f"Could not enable pgvector extension (might not be superuser or non-Postgres): {exc}")

    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
