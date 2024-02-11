This is a Next.js 14 frontend for [GPT-Flask](https://github.com/troyharris/GPTFlask). It integrates with [Clerk](https://clerk.com) for authentication and Google Cloud Storage for storing image files.

## Getting Started

- Deploy a [GPT-Flask](https://github.com/troyharris/GPTFlask) instance
- Create a Clerk account and project (see the [Clerk Documentation](https://clerk.com/docs) for more detail)
- Create a Google Cloud account, project, and storage bucket
- Create a .env.local file (See env.local.example for guidance). You will need info from Clerk, Google Cloud Storage, and the GPT Flask instance
- `npm install`
- `npm run dev` to run the development site
- `npm run build` and `npm run start` to run the production site
- For production, you can use something like pm2 and nginx to run/proxy or deploy, or host on something like [Vercel](https://vercel.com)
