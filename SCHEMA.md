# Database Schema 

This document outlines the PostgreSQL database schema for the **EventLens Platform**, managed via the **Prisma ORM**. The schema is designed to support scalable media storage, Role-Based Access Control (RBAC), Social Interactions, and AI-powered workflows (Facial Recognition & Auto-Captioning).

## Entity Relationship Diagram (ERD) 

```mermaid
erDiagram
    USER {
        String id PK
        String email UK
        String passwordHash
        String name
        String avatarUrl
        Role role
        String referenceSelfie
        FloatArray faceEmbedding "Dynamic Vector Array"
        DateTime createdAt
    }
    EVENT {
        String id PK
        String name
        String description
        DateTime date
        String category
        String coverImage
        String creatorId FK
        DateTime createdAt
    }
    ALBUM {
        String id PK
        String title
        Boolean isPublic
        String eventId FK
        DateTime createdAt
    }
    MEDIA {
        String id PK
        String url
        String thumbnailUrl
        MediaType type
        StringArray tags "AI Tags"
        String aiCaption
        String uploaderId FK
        String albumId FK
        DateTime createdAt
    }
    FACEMATCH {
        String id PK
        String mediaId FK
        String matchedUserId
        Float confidence
    }
    COMMENT {
        String id PK
        String text
        String userName
        String mediaId FK
        String userId FK
        DateTime createdAt
    }
    LIKE {
        String id PK
        String mediaId FK
        String userId FK
        DateTime createdAt
    }
    NOTIFICATION {
        String id PK
        String type
        String message
        Boolean read
        String userId FK
        DateTime createdAt
    }

    USER ||--o{ EVENT : "creates"
    USER ||--o{ MEDIA : "uploads"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ LIKE : "gives"
    USER ||--o{ NOTIFICATION : "receives"
    
    EVENT ||--o{ ALBUM : "contains"
    ALBUM ||--o{ MEDIA : "holds"
    
    MEDIA ||--o{ COMMENT : "has"
    MEDIA ||--o{ LIKE : "receives"
    MEDIA ||--o{ FACEMATCH : "detects"

```

## Core Tables

| Table | Purpose |
| --- | --- |
| `User` | Stores account identity, RBAC roles, and authorization credentials. Includes array of face embeddings for optimized Similarity matching. |
| `Event` | A workspace container storing event metadata such as name, description, date, and category. |
| `Album` | Event-wise album container with Public/Private toggles to restrict access for unauthenticated viewers. |
| `Media` | Stores asset URLs, optimization thumbnails, media types, AI-generated captions, and AI tags. |
| `FaceMatch` | Caches AI facial recognition hits and confidence scores to prevent recalculation. |
| `Comment` | Social comment records containing the username for immediate, join-free UI rendering. |
| `Like` | Social interaction tracking with strict constraints to prevent duplicate likes from the same user. |
| `Notification` | Real-time notification records for likes, comments, tags, uploads, and album updates. |

## Enums

```prisma
enum Role {
  ADMIN
  PHOTOGRAPHER
  CLUB_MEMBER
  VIEWER
}

enum MediaType {
  IMAGE
  VIDEO
}
```

Find the source Prisma schema at: [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).
