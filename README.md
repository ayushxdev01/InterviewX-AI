<div align="center">
<img src="https://raw.githubusercontent.com/ayushxdev01/InterviewX-AI/main/.github/banner.svg" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&size=26&duration=3000&pause=1000&color=5B8DEF&center=true&vCenter=true&width=650&lines=Practice.+Analyze.+Improve.+Get+Hired.;Resume-aware+AI+mock+interviews;Real-time+scoring+plus+feedback+reports;Built+by+Ayush+Gupta" alt="Typing SVG" />

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-5B8DEF?style=for-the-badge&logo=next.js&logoColor=white&labelColor=0D1117)
![React](https://img.shields.io/badge/React-19-5B8DEF?style=for-the-badge&logo=react&logoColor=white&labelColor=0D1117)
![TypeScript](https://img.shields.io/badge/TypeScript-5-5B8DEF?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0D1117)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-3DDC97?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0D1117)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3DDC97?style=for-the-badge&logo=supabase&logoColor=white&labelColor=0D1117)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3-FF7A59?style=for-the-badge&labelColor=0D1117)
![License](https://img.shields.io/badge/License-MIT-8B949E?style=for-the-badge&labelColor=0D1117)

![Repo Size](https://img.shields.io/github/repo-size/ayushxdev01/InterviewX-AI?style=flat-square&color=5B8DEF&labelColor=0D1117)
![Last Commit](https://img.shields.io/github/last-commit/ayushxdev01/InterviewX-AI?style=flat-square&color=3DDC97&labelColor=0D1117)
![Stars](https://img.shields.io/github/stars/ayushxdev01/InterviewX-AI?style=flat-square&color=FF7A59&labelColor=0D1117)

**An AI interview platform that reads your actual resume, interviews you on your actual projects, and hands back a scored feedback report — no generic quiz-app questions.**

<div>

[![Live Demo](https://img.shields.io/badge/🔴_Live_Demo-5B8DEF?style=for-the-badge&logoColor=0D1117&labelColor=0D1117)](https://your-deployed-link.vercel.app/)
[![Report Bug](https://img.shields.io/badge/Report_Bug-FF7A59?style=for-the-badge&labelColor=161B22&color=161B22)](https://github.com/ayushxdev01/InterviewX-AI/issues)
[![Request Feature](https://img.shields.io/badge/Request_Feature-3DDC97?style=for-the-badge&labelColor=161B22&color=161B22)](https://github.com/ayushxdev01/InterviewX-AI/issues)

</div>

</div>

<br/>

## ✨ Overview

**InterviewX AI** simulates a real technical hiring process end-to-end. It parses your resume into structured data, runs a resume-aware AI mock interview with adaptive follow-ups, and generates a detailed scored feedback report — all in a custom dark, developer-console styled UI.

Instead of a static question bank, every interview is generated live from *your* actual projects, skills, and experience — and the AI is explicitly guarded against inventing facts you never said.

<br/>

## 🚀 Core Features

<div align="center">

| Feature | What it does |
|---|---|
| 🧠 **Resume-Aware Interviewer** | Parses your PDF resume and generates questions from your real skills & projects |
| 💬 **Adaptive Follow-Ups** | Vague or low-effort answers get pushed back on instead of skipped past |
| 🚫 **Anti-Hallucination Guardrails** | The AI never invents metrics or facts you didn't actually say |
| 🛑 **Graceful Early Exit** | If you're genuinely stuck, the AI wraps up the interview politely instead of grinding on |
| 📷 **Practice Camera** | Self-view only webcam preview — nothing recorded, nothing analyzed |
| 📈 **Score Trend Dashboard** | Overall / Technical / Communication scores charted across sessions |
| 📄 **One-Click PDF Export** | Download your transcript or feedback report |
| 🔐 **Google OAuth** | Secure sign-in via Supabase Auth, no password management |
| 🎨 **Custom Design System** | Dark developer-console aesthetic — not a generic AI template |

</div>

<br/>

## 🖥️ Preview

> _Add a screenshot or screen recording of the landing page / interview chat / feedback report here._

<br/>

## 🏗️ Tech Stack

<div align="center">

![Next.js](https://img.shields.io/badge/-Next.js-5B8DEF?style=flat-square&logo=next.js&logoColor=0D1117)
![React](https://img.shields.io/badge/-React-5B8DEF?style=flat-square&logo=react&logoColor=0D1117)
![TypeScript](https://img.shields.io/badge/-TypeScript-5B8DEF?style=flat-square&logo=typescript&logoColor=0D1117)
![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-3DDC97?style=flat-square&logo=tailwindcss&logoColor=0D1117)
![Framer Motion](https://img.shields.io/badge/-Framer_Motion-3DDC97?style=flat-square&logo=framer&logoColor=0D1117)
![Supabase](https://img.shields.io/badge/-Supabase-3DDC97?style=flat-square&logo=supabase&logoColor=0D1117)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-3DDC97?style=flat-square&logo=postgresql&logoColor=0D1117)
![Groq](https://img.shields.io/badge/-Groq_API-FF7A59?style=flat-square&logoColor=0D1117)
![Recharts](https://img.shields.io/badge/-Recharts-FF7A59?style=flat-square&logoColor=0D1117)
![Vercel](https://img.shields.io/badge/-Vercel-black?style=flat-square&logo=vercel&logoColor=white)

</div>

<br/>

## 📂 Project Structure

```
InterviewX-AI/
├── app/
│   ├── api/
│   │   ├── resume/parse/route.ts        # PDF upload → text extraction → AI parsing
│   │   └── interview/
│   │       ├── start/route.ts            # Generates the first resume-aware question
│   │       ├── [id]/message/route.ts     # Handles each answer, generates next question
│   │       ├── [id]/edit/route.ts        # Rewinds & regenerates from an edited answer
│   │       └── [id]/feedback/route.ts    # Generates the scored feedback report
│   ├── auth/callback/route.ts            # Supabase OAuth callback
│   ├── components/                        # Logo, MagneticButton, TiltCard
│   ├── dashboard/                          # Resume upload, score analytics
│   ├── interview/[id]/                     # Live chat + feedback report pages
│   ├── login/                              # Google sign-in
│   └── page.tsx                            # Landing page
├── lib/supabase/                           # Browser / server / middleware clients
├── middleware.ts                           # Session refresh + route protection
└── supabase-setup*.sql                     # Database schema & RLS policies
```

<br/>

## ⚡ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/ayushxdev01/InterviewX-AI.git
cd InterviewX-AI
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

Get a free Groq key at [console.groq.com](https://console.groq.com/keys) and set up a free Supabase project at [supabase.com](https://supabase.com).

### 4. Set up the database

Run each `supabase-setup*.sql` file in your Supabase SQL Editor, and create a private `resumes` storage bucket.

### 5. Run the server

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

<br/>

## ☁️ Deployment

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

</div>

Connect your GitHub repo to Vercel and add the environment variables from `.env.local` in the project settings.

<br/>

## 🧠 How It Works

```mermaid
flowchart LR
    A[Resume Upload] --> B[PDF Text Extraction]
    B --> C[Groq: Parse Skills and Projects]
    C --> D[AI Interview Engine]
    D -->|answer| D
    D -->|complete| E[Groq: Score Transcript]
    E --> F[Feedback Report and Dashboard]

    style A fill:#161B22,stroke:#5B8DEF,color:#E6EDF3
    style B fill:#161B22,stroke:#5B8DEF,color:#E6EDF3
    style C fill:#161B22,stroke:#FF7A59,color:#E6EDF3
    style D fill:#161B22,stroke:#5B8DEF,color:#E6EDF3
    style E fill:#161B22,stroke:#FF7A59,color:#E6EDF3
    style F fill:#161B22,stroke:#3DDC97,color:#E6EDF3
```

1. Resume is uploaded and parsed into structured skills/projects/experience data
2. Groq (Llama 3.3) generates the first resume-aware question
3. Each answer is evaluated for substance — vague replies get a follow-up, not a new topic
4. Once complete, the full transcript is scored and summarized into a feedback report
5. Scores are tracked over time on the dashboard

<br/>

## 🗺️ Roadmap

**Shipped ✅**
- Google Auth · Resume parsing · AI mock interviews · Feedback reports · Score dashboard · PDF export · Practice camera

**Planned 🔮**
- Live coding judge with test-case execution
- Voice interview (speech-to-text, delivery scoring)
- AI-analyzed video interview (body language, eye contact, confidence scoring)
- Company-specific question banks
- Recruiter panel / candidate ranking
- GitHub & LeetCode profile analyzers

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br/>

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<br/>

## 👤 Author

<div align="center">

**Ayush Gupta**

[![GitHub](https://img.shields.io/badge/GitHub-ayushxdev01-5B8DEF?style=for-the-badge&logo=github&logoColor=0D1117)](https://github.com/ayushxdev01)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ayush_Gupta-5B8DEF?style=for-the-badge&logo=linkedin&logoColor=0D1117)](https://www.linkedin.com/in/ayushgupta3105/)

</div>

<br/>

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

</div>