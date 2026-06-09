# EventLens: Event & Media Management Platform

EventLens is a scalable, decoupled, full-stack SaaS application designed to revolutionize how event media is stored, shared, and discovered. Built with real-time event-driven interactions and Edge-to-Cloud AI processing, it solves the massive headache of sorting through thousands of event photos by finding exactly the photos you appear in.

## 🌟 Key Features

### 🎭 AI Facial Recognition ("Find My Photos")
- **Edge ML Processing:** Uses `face-api.js` directly in the browser to extract 2D arrays of 128-dimensional facial embeddings locally, completely preserving your raw selfie privacy.
- **Cosine Similarity Engine:** Instantly scans tens of thousands of event photos using advanced Cosine Similarity math and dynamic distance thresholds to find every photo you are in—even across different lighting conditions and angles.

### 🔐 Streamlined Role-Based Access Control (RBAC)
- **4-Tier Hierarchy:** Admin, Photographer, Club Member, and Viewer roles.
- **Dynamic Access:** Granular control over who can create events, manage metadata, upload media in bulk, or interact socially.
- **Merged Workflows:** Unified UI access ensuring Photographers and Club Members share identical upload/delete capabilities to streamline event collaboration.

### ☁️ Smart Cloud Storage & Optimization
- **Cloudinary Integration:** Chunked stream uploads handle massive 40MB+ videos and raw 4K images effortlessly without crashing the server.
- **Dynamic WebP Delivery:** Automatically compresses raw media into optimized WebP formats on-the-fly, reducing CDN bandwidth by up to 80% without losing quality.
- **Watermarking:** Automated dynamic watermarks applied to public downloads based on user roles and event context.

### 💬 Real-Time Social Interactions
- **Server-Sent Events (SSE):** Enjoy instant, real-time UI updates across the globe for likes, comments, and new uploads without needing to refresh the page.
- **Live Notification Feed:** Chronological activity stream tracking global user interactions securely.

### 🛡️ Security & Integrity
- **Permissive Session Architecture:** Replaced strict JWT tokens with a modern session-existence check for smoother UX during continuous usage.
- **Database Write Constraints:** Strict PostgreSQL foreign key constraints ensure ghost comments and orphan likes are impossible.

---

## 🛠️ Technology Stack

**Frontend**
- **Framework:** Next.js 16 (Turbopack) & React 19
- **Styling:** Tailwind CSS v4 & Framer Motion for buttery-smooth micro-animations
- **AI & ML:** `@vladmandic/face-api` (Browser-side tensor computation)
- **Icons & UI:** Lucide React, Recharts, React Dropzone

**Backend**
- **Framework:** Node.js, Express.js
- **Database:** PostgreSQL (Neon/Supabase) via Prisma ORM (`@prisma/adapter-pg`)
- **Cloud Storage:** Cloudinary SDK
- **Security:** bcryptjs

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database URL
- Cloudinary Account (API Key, Secret, Cloud Name)

### 1. Clone the Repository
```bash
git clone https://github.com/Shy-Rez/EventLens.git
cd EventLens
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventlens?schema=public"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```
Run database migrations and start the server:
```bash
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Start the Next.js development server:
```bash
npm run dev
```

The platform will be available at `http://localhost:3000`.

---

## 📚 Documentation

For deep-dives into the inner workings of EventLens, please refer to the following documentation files located in the repository root:

- [**API Reference**](./API.md): Complete list of REST API endpoints, webhooks, and methods.
- [**Architecture**](./ARCHITECTURE.md): System diagrams, AI pipelines, and data flow charts.
- [**Database Schema**](./SCHEMA.md): Complete Entity Relationship Diagrams (ERD) and table configurations.

---

*Built with ❤️ for rapid, scalable, and intelligent media delivery.*
