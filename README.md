# SplitSmart - Roommate Expense Splitter

A modern, colorful expense splitting app built with Next.js 16 and Supabase.

## Features

- 🏠 **Group Management** - Create and manage expense groups
- 💰 **Smart Splitting** - Equal, unequal, and percentage-based splits
- 📱 **PWA Ready** - Install as mobile app
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode
- 🔐 **Secure Auth** - Supabase authentication
- 📊 **Analytics** - Track spending patterns

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Charts:** Recharts
- **Deployment:** Vercel

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd roommate-expense-split
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your Supabase credentials to `.env.local`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
app/
├── auth/           # Authentication pages
├── dashboard/      # Main dashboard
├── groups/         # Group management
├── add-expense/    # Add new expenses
├── analytics/      # Expense analytics
├── profile/        # User profile
├── settle/         # Settlement pages
└── api/           # API routes

components/
├── common/        # Shared components
├── layout/        # Layout components
└── ui/           # UI components
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)