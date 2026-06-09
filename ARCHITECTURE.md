# Architecture Diagram

This document outlines the architecture, data flows, and infrastructure design for the **Event & Media Management Platform**. The system is built as a decoupled, full-stack SaaS application emphasizing scalable cloud storage, real-time event-driven interactions, and AI processing.

## System Architecture

```mermaid
flowchart TB
  subgraph Client["Client Layer (React / Next.js)"]
    Web["Web Interface (Tailwind + Framer Motion)"]
    State["RBAC State (useRole Hook)"]
    ML_Client["Edge ML Engine (face-api.js)"]
    SSE_Listener["SSE Listener (Real-time Toasts)"]
  end

  subgraph API["Backend API Layer (Node.js + Express)"]
    Gateway["Express Router & API Gateway"]
    Auth["Session Existence Check"]
    RBAC["Role-Based Middleware"]
    UploadController["Stream Chunker (Multer)"]
    VectorEngine["Vector Math Engine"]
    SSE_Emitter["EventEmitter (Server-Sent Events)"]
    Webhook["Cloudinary Webhook Listener"]
  end

  subgraph Data["Data Layer"]
    Postgres["PostgreSQL"]
    Prisma["Prisma ORM"]
  end

  subgraph Cloud["Cloud Infrastructure & AI"]
    Cloudinary["Cloudinary CDN & Asset Store"]
    AWSRek["AWS Rekognition (Moderation/Tags)"]
    GoogleAI["Google AI (Speech-to-Text / Transcripts)"]
  end

  Web --> State
  Web --> ML_Client
  Web --> Gateway
  SSE_Listener <--> SSE_Emitter

  Gateway --> Auth
  Gateway --> RBAC
  Gateway --> Prisma
  Gateway --> VectorEngine
  VectorEngine --> Prisma
  Prisma <--> Postgres

  Gateway --> UploadController
  UploadController -->|Streams Media| Cloudinary
  Cloudinary -->|Async Processing| AWSRek
  Cloudinary -->|Async Processing| GoogleAI
  
  GoogleAI -.->|Triggers POST| Webhook
  Webhook --> Prisma
  
  Gateway --> SSE_Emitter
```

## Smart Upload & AI Processing Pipeline

```mermaid
sequenceDiagram
  participant User
  participant Web as Client UI
  participant API as Node.js / Express
  participant Cloud as Cloudinary
  participant AI as Google/AWS AI
  participant DB as PostgreSQL
  participant SSE as SSE Emitter

  User->>Web: Drops 40MB Video
  Web->>API: POST /api/upload (Multipart Form)
  API->>API: Validate RBAC & Parse 2D Face Vector Arrays
  API->>Cloud: upload_chunked_stream (5MB Chunks)
  Cloud-->>API: Returns CDN secure_url immediately
  API->>DB: Save Media Record & Array of Vectors
  API-->>Web: Return 201 Success (UI Updates)
  
  Note over Cloud,AI: Background AI Processing Begins
  Cloud->>AI: Send Video to Google Intelligence (Speech)
  AI-->>Cloud: Generates async .transcript file
  
  Cloud->>API: POST /api/webhooks/cloudinary (Webhook Callback)
  API->>DB: Parses transcription text and updates aiCaption
  API->>SSE: Emit UI Refresh Event
  SSE-->>Web: Update Gallery with Captions
```

## Core Request & Data Flow

```mermaid
  flowchart LR
  User["User"] --> Browser["Browser UI"]
  
  subgraph Client Processing
    Browser -->|Extracts 128D Array| Vector["face-api.js"]
  end

  Browser --> API["Express API"]
  API --> Auth["Session Persistence Validation"]
  Auth --> RBAC["Role Middleware"]
  
  RBAC --> FeatureBranch{Feature routing}
  
  FeatureBranch -->|Social| Social["Like / Comment"]
  FeatureBranch -->|Discovery| Search["Vector Similarity Search"]
  FeatureBranch -->|Delivery| Transform["URL Transformations"]
  
  Social --> DB["PostgreSQL"]
  Search --> DB
  Social --> SSE["EventEmitter"]
  SSE --> Browser
  
  Transform -->|Dynamic Subtitles / Watermarks| Cloud["Cloudinary CDN"]
  Cloud --> Browser
```

## Role-Based Access Control (RBAC) Matrix

| Role | Capabilities |
| --- | --- |
| Admin | Create/edit events, manage metadata, change user roles globally, full access to all private and public media, moderate interactions. |
| Photographer | Upload media in bulk, delete media, bypass public/private restrictions, view assigned private albums, auto apply watermarks. |
| Club Member | View club-only private albums, interact socially, upload media, delete media, use "Find My Photos" AI search. |
| Viewer | Default tier. View public albums only, share public links, download strictly watermarked media. |
