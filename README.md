# Agent With Me (AI-Powered Housing & Smart Matching Platform)

*Role: Core Contributor & Algorithm Engineer*

A collaborative full-stack real estate platform that goes beyond simple listings. Agent With Me connects tenants with landlords/realtors and introduces a novel "Smart Share" feature that matches potential roommates based on lifestyle compatibility.

🔗 Live Demo: [https://agent-with-me-v2.vercel.app](https://agent-with-me-v2.vercel.app)

## 🚀 Key Features

### 1. 🏘️ Marketplace & Management
* Multi-Role System: Dedicated accounts for Landlords and Realtors to upload, manage, and promote property listings.
* Standard Renting: Streamlined search and inquiry process for prospective tenants.

### 2. 🤝 Smart Space Sharing (Algorithmic Matching)
* Similarity Engine: Users looking to rent out their current space (or find a roommate) are matched based on a custom compatibility algorithm.
* The Logic: I developed a specialized algorithm that calculates similarity scores between user profiles to ensure high-quality roommate matches.
* Algorithm Source: You can view the core matching logic and its visual interface here: [Similarity Prediction Quotient (SPQ)](https://github.com/SamuelAyibatarri/minor-project-1-s-p-q)

### 3. 🤖 AI & Future Integration
* Gemini Integration: The matching interface utilizes Google Gemini for enhanced user interaction and data interpretation.
* Communication Layer: Currently integrating [Converse](https://github.com/SamuelAyibatarri/converse), a custom Hono/WebSocket microservice to power real-time negotiations.

## 🔮 Future Roadmap: The "Agent Abstraction"
Our long-term vision is to fully abstract the traditional real estate agent.
* Current: Facilitating connections between landlords and tenants.
* Future: The platform becomes the "Manager," automating viewing scheduling, vetting, and lease management, effectively replacing the middleman for landlords.

## 🛠️ Technical Stack
* Frontend: Next.js 14 (App Router), Tailwind CSS
* Backend: Node.js, Cloudflare Workers (via Converse integration)
* Algorithms: Custom Similarity Logic (TS), Google Gemini API
* Collaboration: Built in partnership with [kenmentorcode], featuring merged contributions and shared architecture.
