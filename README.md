# 4050 E-commerce Platform

Heritage apple products e-commerce platform built with Next.js. Sell homemade artisan products (applesauce, apple butter, jams, jellies) while supporting local communities through charitable giving.

## Tech Stack

- **Framework:** Next.js 16.0.5 (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 4.x
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Authentication:** NextAuth.js v5
- **Payments:** Stripe
- **Email:** Resend
- **Shipping:** EasyPost
- **Deployment:** Vercel + Railway

## Prerequisites

- **Node.js** 18.17+ or 20.0+ ([Download](https://nodejs.org/))
- **npm** 9.0+
- **Git** 2.30+
- **PostgreSQL** 15+ (local or hosted)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 4050
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/4050"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe (use test keys for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# EasyPost
EASYPOST_API_KEY="EZAK..."

# Resend
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="orders@yourdomain.com"
```

### 4. Set Up Database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests (coming soon)
```

## Project Structure

```
4050/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── shop/               # Product catalog
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   ├── admin/              # Admin dashboard
│   └── api/                # API routes
├── components/             # React components
├── lib/                    # Utilities and types
├── prisma/                 # Database schema
├── public/                 # Static assets
└── docs/                   # Documentation
    ├── brief.md            # Project brief
    ├── prd.md              # Product requirements
    └── architecture.md     # Technical architecture
```

## Development Workflow

1. **Read the story** in `docs/stories/`
2. **Implement features** following architecture in `docs/architecture.md`
3. **Test locally** before committing
4. **Commit changes** with clear messages
5. **Deploy** automatically via Vercel on push to `main`

## Documentation

- **[Project Brief](docs/brief.md)** - Business requirements and goals
- **[PRD](docs/prd.md)** - Product requirements and user stories
- **[Architecture](docs/architecture.md)** - Technical architecture and patterns
- **[Open Questions](docs/open-questions.md)** - Business decisions pending

## Contributing

This is a solo-operated project, but contributions are welcome! Please ensure:
- Code follows TypeScript strict mode
- Components are properly typed
- Tests are included for new features
- Commits are descriptive

## License

Private project - All rights reserved

## Contact

For questions or support, see [docs/open-questions.md](docs/open-questions.md) for contact information.
