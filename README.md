# 📧 Email Assistant Agent — SELO

> Bilingual Gmail agent: classify the tray, stamp priority and draft a reply in the tone you pick, painted in the ividi.dev palette (black, burnt orange, amber).

[![CI](https://github.com/VidiPT89/EmailAssistant-Agent/actions/workflows/ci.yml/badge.svg)](https://github.com/VidiPT89/EmailAssistant-Agent/actions/workflows/ci.yml)

**🌐 Live demo:** [selo.ividi.dev](https://selo.ividi.dev) · Runs on the sample tray: classify, stamp priority and draft replies with the local tools, no Gmail or model key needed.

[🐞 Report Bug](https://github.com/VidiPT89/EmailAssistant-Agent/issues) · [✨ Request Feature](https://github.com/VidiPT89/EmailAssistant-Agent/issues)

SELO is a Next.js desk for your inbox. Connect Gmail with OAuth, or work on the sample tray. Each message is classified (urgent, commercial, spam or general), priority is stamped, and a reply is drafted through tools. The UI is European Portuguese / English, with language and dark / light theme toggles remembered in `localStorage`. Light mode keeps the same ividi.dev palette on cream paper.

Without Google OAuth keys the sample tray still runs. Without a model key, classification and drafts use local tools so the desk works on a laptop.

## ✨ Main Features

- 🔑 **Gmail OAuth** — read the inbox and stamp star / important
- 🏷️ **Automatic classification** — urgent, commercial, spam, general
- ✍️ **Suggested replies** — formal, warm, brief or firm
- ⭐ **Priority stamps** — high, medium, low (starred when high)
- 🛠️ **Tools** — classify, set priority, draft reply
- 🌍 **PT / EN toggle** — remembered in `localStorage`
- 🌓 **Dark / light** — same burnt orange and amber, cream paper in light mode
- 🔎 **Search and filters** — urgent, commercial, spam or general
- 🎬 **Motion** — ember glow, wax-seal stack and tray reveal

## 🛠️ Technologies

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)
![Gmail](https://img.shields.io/badge/Gmail_API-EA4335?style=flat&logo=gmail&logoColor=white)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **App** | Next.js App Router | Pages and API routes |
| **Mail** | Gmail API + OAuth 2.0 | Inbox list and priority labels |
| **Agent** | Local tools, optional Groq / Gemini / OpenAI / Anthropic | Classify, stamp, draft |
| **Motion** | Framer Motion | Landing and tray reveal |

## 🧱 Project Structure

```text
EmailAssistant-Agent/
├── src/
│   ├── app/
│   ├── components/
│   ├── i18n/
│   └── lib/
├── tests/
├── LICENSE
└── README.md
```

## ▶️ How to Run

### Prerequisites

- **Node.js** 18+
- Optional: a Google Cloud OAuth client with Gmail scopes
- Optional: one free-tier model key (Groq or Gemini preferred)

### Installation

```bash
git clone https://github.com/VidiPT89/EmailAssistant-Agent.git
cd EmailAssistant-Agent
cp .env.example .env
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To connect a real inbox, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_REDIRECT_URI` (`http://localhost:3000/api/auth/callback`). Enable the Gmail API and add that redirect URI in Google Cloud.

To use a hosted model, set `GROQ_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` (or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`). `AI_MODEL` is optional.

## 📖 Usage

1. Toggle **PT** or **EN**, and **Dark** or **Light**, in the header.
2. Open the tray. Use the sample messages, or connect Gmail.
3. Filter by stamp or search, then pick a message.
4. Choose a tone, then classify, suggest a reply or stamp priority.
5. Copy the draft into Gmail when you are ready to send.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mail` | List inbox or sample tray |
| POST | `/api/mail/act` | Classify, draft or stamp priority |
| GET | `/api/auth/google` | Start Gmail OAuth |
| GET | `/api/auth/callback` | Finish Gmail OAuth |
| GET | `/api/auth/logout` | Clear the Gmail session |

## 🧪 Testing

```bash
npm test
```

`node:test` checks classification, priority stamps, local drafts per tone, theme parsing, tray filters and relative times.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Developed by **David Arsénio Martins**  
🌐 [ividi.dev](https://ividi.dev/) · 💻 [github.com/VidiPT89](https://github.com/VidiPT89/)
