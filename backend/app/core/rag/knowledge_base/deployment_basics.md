# Deployment Best Practices

## Fast Deployment for Demos and Hackathons
- Frontend: Vercel or Netlify (connect GitHub repo, auto-deploys on push)
- Backend: Railway or Render free tier
- Database: Firebase Firestore (no separate hosting needed) or Supabase
- Avoid spending time on custom domains, SSL setup, or load balancing —
  default subdomains are fine for a demo

## Production-Style Deployment for Placement Projects
- Containerize the backend with Docker
- Use a proper reverse proxy setup understanding (Nginx concepts)
- Environment variables managed through .env files, never committed to git
- Separate staging and production environments if possible
- Basic monitoring/logging (even just structured console logs) to show
  awareness of observability

## Common Mistakes
- Committing API keys or secrets directly into the repository
- Not setting up CORS correctly, leading to frontend-backend connection issues
- Forgetting to set environment variables on the deployment platform
- Deploying without testing the production build locally first