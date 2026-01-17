from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel, Relationship, JSON
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime

def generate_uuid():
    return str(uuid4())

class User(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    email: str = Field(index=True, unique=True)
    password: str
    name: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    posts: List["Post"] = Relationship(back_populates="author")
    projects: List["Project"] = Relationship(back_populates="author")
    comments: List["Comment"] = Relationship(back_populates="author")

class Post(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    slug: str = Field(index=True, unique=True)
    title: str
    description: str
    content: str = Field(sa_column=Column(Text))
    published: bool = Field(default=False, index=True)
    category: str = Field(default="Tech")
    coverImage: Optional[str] = None
    tags: List[str] = Field(default=[], sa_column=Column(JSON))
    likes: int = Field(default=0)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    authorId: str = Field(foreign_key="user.id", index=True)
    author: User = Relationship(back_populates="posts")
    comments: List["Comment"] = Relationship(back_populates="post")

class Project(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    slug: str = Field(index=True, unique=True)
    title: str
    description: str
    fullDescription: str = Field(sa_column=Column(Text))
    techStack: List[str] = Field(default=[], sa_column=Column(JSON))
    features: List[str] = Field(default=[], sa_column=Column(JSON))
    githubLink: Optional[str] = None
    demoLink: Optional[str] = None
    image: str
    category: Optional[str] = None
    published: bool = Field(default=True, index=True)
    likes: int = Field(default=0)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    authorId: str = Field(foreign_key="user.id", index=True)
    author: User = Relationship(back_populates="projects")
    comments: List["Comment"] = Relationship(back_populates="project")

class Comment(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    content: str
    guestName: str = Field(default="Guest")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    postId: Optional[str] = Field(default=None, foreign_key="post.id", index=True)
    post: Optional[Post] = Relationship(back_populates="comments")

    projectId: Optional[str] = Field(default=None, foreign_key="project.id", index=True)
    project: Optional[Project] = Relationship(back_populates="comments")

    authorId: Optional[str] = Field(default=None, foreign_key="user.id")
    author: Optional[User] = Relationship(back_populates="comments")

class SiteConfig(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    ownerName: str = Field(default="Garry")
    avatarInitial: str = Field(default="G")
    avatarGradient: str = Field(default="from-blue-600 to-indigo-600")
    avatarImage: Optional[str] = None
    siteTitle: Optional[str] = Field(default="Portfolio")
    availableCategories: List[str] = Field(default=["Tech", "Design", "Life"], sa_column=Column(JSON))
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class AnalyticsEvent(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    path: str = Field(index=True)
    browser: Optional[str] = None
    os: Optional[str] = None
    device: Optional[str] = Field(default="desktop")
    country: Optional[str] = None
    ip: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow, index=True)
