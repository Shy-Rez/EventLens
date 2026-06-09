# API Documentation

Base URL: `https://eventlens-backend-cufi.onrender.com/api`
Base URL (Local): `http://localhost:5000/api`
Deployment: The backend runs on Node.js/Express, and the frontend is built and served through Next.js.

## Authentication

- `POST /api/login` verifies email/password (with bcrypt or demo failsafe) and returns the user object.
- `POST /api/seed-users` (Admin utility) re-seeds the database with demo accounts and secure hashes.

## Events & Albums

- `GET /api/events?role=...` returns a list of events filtered by public visibility or user clearance levels.
- `GET /api/events/:id` fetches a single event with nested albums and authorized media.
- `POST /api/events` initializes a new event and creates a default "General Media" album.
- `PUT /api/albums/:id` updates album metadata, description, category, and privacy settings.

## Media & Uploads

- `GET /api/events/:eventId/media` fetches all media assets aggregated across an event's albums.
- `POST /api/upload` accepts multipart/form data. Streams files to Cloudinary, extracts arrays of face-embeddings for Postgres indexing, and generates AI tags.
- `POST /api/webhooks/cloudinary` receives asynchronous callbacks from Cloudinary's AI services (e.g., `google_speech`) to update the database with transcription data.
- `DELETE /api/media/:mediaId` performs hard-delete on both the database and the remote Cloudinary asset.

## Social & Interactions

- `GET /api/media/:mediaId/interactions` returns comment threads and total like counts.
- `POST /api/media/:mediaId/like` toggles likes and emits a real-time notification to the target user.
- `POST /api/media/:mediaId/comment` saves comments with user metadata and triggers notification events.
- `GET /api/activity` returns a combined, chronological feed of media uploads and user join events.

## Real-Time Notifications

- `GET /api/notifications/stream/:userId` provides a Server-Sent Events (SSE) stream for instant UI updates.
- `GET /api/notifications/:userId` fetches historical notifications for a specific user.

## AI

- `GET /api/search/advanced` runs multi-criteria queries (eventName, tag, date, uploader) against the indexed database.
- `POST /api/search/face`  takes a multi-dimensional float vector and returns matching media using calculations and dynamic scaling.

## Admin And Analytics

- `GET /api/users` lists all system users for admin.
- `POST /api/users` creates a new member profile.
- `PUT /api/users/:id/role` modifies a user's role.
- `DELETE /api/users/:id` removes user accounts.
- `GET /api/analytics` returns aggregate statistics (total users, events, media, and likes).