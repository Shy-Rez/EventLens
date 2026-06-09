# EventLens

EventLens is an AI powered Event & Media Management Platform designed for event teams, photographers, and clubs. It provides a centralized, full stack SaaS system for managing events, organizing media, enabling real-time social interactions, and discovering content through edge processed facial recognition and advanced similarity search.

## Overview

During major events, thousands of photos and videos are generated and fragmented across storage systems, making it difficult for attendees to find themselves and for organizers to manage the media effectively.

EventLens addresses this problem through:

- Event based media organization
- Role based security and access control
- Real time social engagement features
- AI powered personalized photo retrieval
- Scalable cloud architecture
- Automatic media optimization and delivery

---

## Features

### Event Management

- Create, edit, and categorize events
- Manage event metadata and cover images
- Generate nested event wise public and private albums
- Sort and filter events dynamically

### Media Management

- Upload high resolution images and large videos
- Bulk multipart chunk streaming to prevent server overload
- Automatic dynamic WebP delivery for bandwidth optimization
- Real time upload progress and processing status

### Authentication and Access Control

Role-based access control managed via session persistence for:

- Admin
- Photographer
- Club Member
- Viewer

Features include:

- Secure login and registration flows
- Seamless session management
- Protected upload and administrative routes
- Granular permissions for viewing private vs. public albums

### Social Features

- Interactive likes and comments
- Media favoriting and sharing
- User tagging capabilities
- Real time notification streams via Server-Sent Events (SSE)
- Global chronological activity feeds

### AI Features

#### Advanced Search

Search media comprehensively by:

- Event Name
- AI-generated scene tags
- Upload Date
- Uploader Name

#### Facial Recognition

Users can seamlessly find themselves across thousands of photos:

1. Extract multi dimensional facial embeddings locally in the browser to preserve raw privacy
2. Process multi face 2D arrays against the PostgreSQL database
3. Retrieve accurate matches using math and dynamic distance thresholds

### Cloud Storage

- Cloudinary CDN integration
- Secure, scalable cloud asset management
- Seamless background delivery and processing
- Auto tagging and webhook synchronization

### Watermarking

Dynamic visual watermark generation during media downloads utilizing:

- Club Name
- Event Name
- Requesting User's Role

### Analytics

- Administrative dashboard for event statistics
- Global media storage utilization metrics
- Compression ratio and CDN traffic bandwidth tracking

---

## Technology Stack

### Frontend

- React 
- Next.js (Turbopack)
- Tailwind CSS
- Framer Motion

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Prisma ORM

### Cloud Services

- Cloudinary SDK

### AI and Machine Learning

- face-api.js (Edge-based Tensor Computation)
- AWS Rekognition (Cloudinary Add-on)
- Google Speech Intelligence (Cloudinary Add-on)

---

## Project Structure

```text
EventLens/
│
├── API.md
├── ARCHITECTURE.md
├── SCHEMA.md
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   └── index.ts
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## Setup

The deployed project can be accessed at [Render]https://eventlens-frontend-7ck7.onrender.com

---

