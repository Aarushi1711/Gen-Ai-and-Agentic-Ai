# Technology Stack Selection Guide

## For Hackathons (24-72 hours)
Prioritize speed of development over scalability. Recommended stack:
- Frontend: React with Vite, or plain HTML/Tailwind for very fast setups
- Backend: Firebase (Firestore + Auth + Hosting) to avoid writing backend code
- AI features: Use hosted APIs (Gemini API, OpenAI API) rather than training
  or hosting your own models
- Avoid: Docker, Kubernetes, microservices, custom auth systems, CI/CD pipelines

## For Placement-Focused Projects (2-3 months)
Prioritize demonstrating industry-relevant skills to recruiters. Recommended stack:
- Frontend: React or Next.js with TypeScript
- Backend: FastAPI (Python) or Express (Node.js) with a real relational database
- Database: PostgreSQL or MySQL, with proper schema design and migrations
- Auth: JWT-based authentication implemented from scratch (not just Firebase)
  at least once, to show understanding of the underlying mechanism
- Include: Docker for containerization, basic CI/CD with GitHub Actions,
  automated tests
- Deploy: Render, Railway, or AWS free tier

## For Research Projects (3-6 months)
Prioritize reproducibility and depth over breadth. Recommended stack:
- Whatever stack is standard in the relevant research subfield
- Strong emphasis on documentation, experiment tracking, and evaluation metrics
- Version control discipline with clear commit history

## For Learning Projects (Beginner, any timeline)
Prioritize simplicity and understanding over best practices. Recommended stack:
- Python with Flask (simpler than FastAPI/Django for beginners)
- SQLite instead of PostgreSQL (zero setup)
- Plain HTML/CSS or minimal Bootstrap for frontend
- Avoid introducing more than 2-3 new technologies at once