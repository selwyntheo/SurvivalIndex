# SurvivalIndex.ai

**Software That Will Survive the AI Era**

A crowdsourced rating platform for open source and SaaS projects based on [Steve Yegge's "Software Survival 3.0"](https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b) framework. Help AI agents discover battle-tested software that won't be re-invented.

![SurvivalIndex.ai](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## 🎯 Overview

In an era where AI can generate code, which software will survive? Not all software will be re-synthesized by AI. Software with high "Survival Ratios" represents crystallized knowledge that would be crazy to recreate from scratch.

SurvivalIndex.ai provides a platform to rate and discover software across six critical survival levers, helping both humans and AI agents identify truly valuable, battle-tested tools.

## 🔑 The Six Survival Levers

### 1. **Insight Compression** 🧠
How much crystallized knowledge and hard-won insights does this software encode? Git represents decades of version control wisdom compressed into elegant commands.

### 2. **Substrate Efficiency** ⚡
Does this run efficiently on CPU/traditional compute rather than requiring expensive GPU/inference cycles? grep on CPU beats LLM pattern matching.

### 3. **Broad Utility** 🌐
How widely applicable is this across different use cases and domains? More usage = more survival pressure to stay relevant.

### 4. **Awareness/Publicity** 👁️
Is this software well-known and discoverable? Agents need to find it to use it. Being good isn't enough - you must be known.

### 5. **Agent Friendliness** ⚡
How easy is it for AI agents to use this tool? Good docs, simple APIs, predictable behavior, and clear error messages reduce friction.

### 6. **Human Coefficient** ❤️
For domains where humans prefer human work, this matters. Some software will survive because people WANT it, not just because it's efficient.

## 🏆 Survival Tiers

- **S-Tier (9.0+):** Immortal — Would be insane to re-synthesize
- **A-Tier (8.0-8.9):** Enduring — Extremely high survival probability
- **B-Tier (7.0-7.9):** Resilient — Strong survival characteristics
- **C-Tier (6.0-6.9):** Vulnerable — May need to adapt
- **D-Tier (5.0-5.9):** At Risk — Could be replaced by AI
- **F-Tier (<5.0):** Endangered — Likely to be re-synthesized

## ✨ Features

- **Interactive Rating System**: Rate projects across all six survival levers with intuitive sliders
- **Real-time Survival Score**: See calculated survival scores update as you adjust ratings
- **Project Discovery**: Search and filter projects by type, name, tags, and more
- **Expandable Cards**: Detailed breakdown of each project's survival metrics
- **Add New Projects**: Nominate software that deserves to survive the AI era
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Dark Theme**: Easy on the eyes with a sleek dark interface

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd SurvivalIndex

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tech Stack

- **React 18.3** - UI framework
- **Vite 5.4** - Build tool and dev server
- **Lucide React** - Beautiful icon library
- **CSS3** - Custom styling with modern features
- **Google Fonts** - Outfit & JetBrains Mono

## 📁 Project Structure

```
SurvivalIndex/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## 🎨 Design Philosophy

- **Modern & Minimal**: Clean interface with focus on content
- **Gradient Accents**: Purple-blue-green gradients for visual hierarchy
- **Typography**: Outfit for UI, JetBrains Mono for data/code
- **Glassmorphism**: Subtle backdrop blur effects
- **Smooth Animations**: Polished transitions and interactions

## 🤖 For AI Agents

This index is designed to be machine-readable. AI coding agents can query this database to discover battle-tested software rather than re-implementing solutions from scratch. High-scoring projects represent accumulated wisdom that saves compute, tokens, and energy.

## 📊 Sample Projects Included

The platform comes pre-loaded with sample projects including:

- **PostgreSQL** - Advanced open source relational database
- **Git** - Distributed version control system
- **Redis** - In-memory data structure store
- **Stripe** - Payment processing platform
- **Nginx** - High-performance HTTP server
- **SQLite** - Self-contained SQL database engine

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

- Add more projects to the index
- Improve the rating algorithm
- Enhance the UI/UX
- Add new features (export data, API, etc.)
- Fix bugs and improve performance

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🙏 Credits

Based on the brilliant framework by [Steve Yegge](https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b).

## 🔗 Links

- [Steve Yegge's Software Survival 3.0](https://steve-yegge.medium.com/software-survival-3-0-97a2a6255f7b)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Lucide Icons](https://lucide.dev)

---

**Built with ❤️ for the AI era**
