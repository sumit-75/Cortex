# Cortex ⚡

A sleek, modern web application for saving, organizing, and embedding your favorite links and media from **YouTube** and **Twitter / X** into custom folders.

---

## ⚡ Key Features

- 🔐 **Google OAuth Authentication**: Secure single sign-on powered by Auth.js (NextAuth v5).
- 🎬 **Rich Media Embeds**: Automatic oEmbed metadata fetching for YouTube videos (HD support) and Twitter / X posts.
- 📁 **Folder Organization**: Categorize links into custom folders with live post counts and instant folder management.
- ⚡ **Instant 0ms UI & Skeleton Loading**: Optimistic tab switching and streaming skeleton loaders during navigation.
- 🔍 **Search & Filter**: Search saved posts by title and filter by platform (All, YouTube, Twitter / X).
- 🔄 **Serverless DB Resiliency**: Built-in auto-reconnect retry wrapper (`withRetry`) for Neon PostgreSQL serverless database.
- 📱 **Fully Responsive**: Mobile-first fluid design with horizontal category pill scrolling and high-contrast theme (`#FF7900` Orange & White).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Shadcn UI
- **Database**: PostgreSQL (Neon Serverless) via Prisma ORM
- **Auth**: Auth.js v5 (Google OAuth)

---

## 🚀 Getting Started

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

### 2. Installation & Running

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

Open [https://cortex-v1.vercel.app/]((https://cortex-v1.vercel.app/)) to start using Cortex!
