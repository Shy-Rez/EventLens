---
marp: true
theme: default
class: lead
paginate: true
size: 16:9
style: |
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;800&display=swap');
  
  section {
    font-family: 'Outfit', sans-serif;
    background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
    color: #f8fafc;
    font-size: 26px;
    padding: 60px 80px;
  }
  
  h1 {
    color: #38bdf8;
    font-size: 3.8em;
    font-weight: 800;
    margin-bottom: 0.1em;
    text-shadow: 0 0 40px rgba(56, 189, 248, 0.4);
    letter-spacing: -1.5px;
  }
  
  h2 {
    color: #e2e8f0;
    font-size: 2.4em;
    border-bottom: 2px solid rgba(56, 189, 248, 0.5);
    padding-bottom: 0.3em;
    margin-bottom: 0.8em;
    font-weight: 600;
    letter-spacing: -0.5px;
  }
  
  h3 {
    color: #7dd3fc;
    font-weight: 500;
    font-size: 1.4em;
    margin-top: 0;
    margin-bottom: 0.5em;
  }

  strong {
    color: #38bdf8;
    font-weight: 600;
  }

  ul {
    line-height: 1.5;
  }
  
  li {
    margin-bottom: 0.5em;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 35px;
  }

  .grid > div {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 4px solid #0ea5e9;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .highlight-box {
    background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0.02) 100%);
    border-left: 6px solid #38bdf8;
    padding: 1.5em;
    border-radius: 0 16px 16px 0;
    margin-top: 1.5em;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }

  section.title-slide {
    text-align: center;
    background: radial-gradient(circle at center, #18181b 0%, #000000 100%);
  }
---

<!-- _class: title-slide -->

# EventLens
### The Intelligent Event Media Management Platform

**AI-Powered Discovery | Real Time Collaboration | Smart Infrastructure**

---

## The "Post Event" Media Nightmare
Organizations and Clubs host many incredible events, but managing the aftermath is painful.

- **Extreme Fragmentation:** Thousands of photos and videos get scattered across Drives and local folders.
- **The Search Penalty:** Attendees waste hours scrolling to find the 3 photos they appear in.
- **Hardware Limitations:** Serving massive raw videos constantly crashes web servers.
- **Privacy Liabilities:** Unrestricted access links expose private club photos.

---

## The Solution
A centralized ecosystem engineered for modern event teams.

<div class="highlight-box">
EventLens replaces scattered drives with a singular, intelligent hub that categorizes, optimizes, protects, and delivers event memories flawlessly.
</div>

- **For Organizers:** Effortless bulk uploading, AI tagging, and instant analytics.
- **For Attendees:** Instant AI facial discovery, QR-based sharing, and seamless social engagement.

---

## Media Engine & Event Architecture
**Built to Scale. Engineered for Delivery Speed.**

<div class="grid">
<div>

### Media Management
- **Multipart Chunking:** Safely streams massive videos.
- **Dynamic WebP:** Slashes bandwidth by 80%.
- **Duplicate Image Detection:** Auto rejects duplicate uploads.
- **Offline Caching:** Media loads instantly, even offline.
- **Infinite Scrolling:** Smooth browsing of huge galleries.

</div>
<div>

### Event Architecture
- **Nested Albums:** Organize events hierarchically.
- **Collaborative Albums:** Multiple photographers can upload seamlessly.
- **QR-Based Sharing:** Scan to instantly share or join an event album without accounts!

</div>
</div>

---

## "Find My Photos" & Advanced Search
**The End of Manual Photo Searching**

<div class="grid">
<div>

### Facial Recognition AI
- **Edge Extraction:** Browser extracts a mathematical multi dimensional vector array.
- **Math Engine:** Postgres backend scans thousands of photos in seconds.
- **The Result:** A gallery of every photo you appear in, generated in seconds.

</div>
<div>

### Advanced Metadata Search
Filter media instantly by:
- Event Name
- AI-Generated Scene Tags
- Upload Date
- Specific Photographer Name

</div>
</div>

---

## Security, Moderation & Protection

- **Streamlined RBAC:** Admin, Photographer, Member, and Viewer roles managed via a modern permissive session check.
- **Automated Image Moderation:** AWS AI automatically scans and flags inappropriate content during upload.
- **Dynamic Watermarking:** Automatically burns Club & Event logos onto media downloaded by standard viewers to protect intellectual property.
- **Data Integrity:** Strict PostgreSQL foreign key constraints ensure ghost records and broken relations are impossible.

---

## Real Time Social & Global Analytics
**Turning static folders into interactive experiences**

<div class="grid">
<div>

### Real Time Social Layer
- **Server Sent Events (SSE):** Likes, comments, and uploads update globally in real time.
- **Global Activity Feeds:** A centralized chronological timeline tracking all interactions across an event.

</div>
<div>

### Analytics Dashboard
Comprehensive Admin tracking:
- Storage utilization insights
- User engagement (likes/comments mapping)
- Event growth and upload velocity metrics

</div>
</div>

---

## Tech Stack

- **Frontend:** Next.js (Turbopack) & React 19 for instantaneous page loads. Styled with Tailwind CSS and Framer Motion.
- **Backend:** Node.js & Express.js API Gateway handling heavy stream buffers.
- **Database:** PostgreSQL managed securely via Prisma ORM.
- **AI & Cloud:** `face-api.js` (for facial recognition), Cloudinary SDK, AWS Rekognition.

---

## Key Learnings

- **Real-Time Features:** Building live "likes" and comments demonstrated how to instantly sync data across multiple users at the same time.
- **Smart AI Processing:** Moving the heavy AI facial scanning to the user's browser improves app speed and protects user privacy.
- **Access Control Systems:** Building a strict role-based system highlighted the importance of keeping private event media secure from unauthorized viewers.
- **Cloud Integrations:** Securely connecting to external cloud services for storage and moderation requires careful management of API keys and data streams.

---

## Future Goals
**What more can be done for the EventLens Platform?**

- **AI Highlight Reels:** Automatically cutting together the best moments and most tagged users from an event into an auto-generated, shareable video.
- **Voice-Powered Retrieval:** Natural language querying ("Show me photos of the robotics team from yesterday afternoon").
- **Native Mobile App:** Expanding the Next.js foundation into dedicated iOS and Android experiences.

## Thank You
