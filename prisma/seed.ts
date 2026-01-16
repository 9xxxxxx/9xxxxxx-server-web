import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Ensure User exists
  const ownerEmail = 'garry@example.com'
  let user = await prisma.user.findUnique({
    where: { email: ownerEmail },
  })

  if (!user) {
    console.log('Creating default user...')
    user = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: 'Garry',
        // In a real app, hash this. For seed/dev, plain text or simple hash is often used if auth handles it.
        // Assuming the auth system might hash it, but here we just put a placeholder.
        password: 'password123', 
      },
    })
  }

  // 2. Ensure SiteConfig exists
  const existingConfig = await prisma.siteConfig.findFirst()
  if (!existingConfig) {
    console.log('Creating site config...')
    await prisma.siteConfig.create({
      data: {
        ownerName: 'Garry',
        siteTitle: 'My Digital Garden',
        avatarInitial: 'G',
        avatarGradient: 'from-blue-600 to-indigo-600',
      },
    })
  }

  // 3. Seed Projects
  console.log('Seeding projects...')
  
  const projects = [
    {
      slug: 'ai-analytics-dashboard',
      title: 'AI Analytics Dashboard',
      description: 'A futuristic dashboard for visualizing large-scale AI model performance metrics in real-time.',
      fullDescription: `
# AI Analytics Dashboard

This project visualizes complex datasets from AI model training sessions.

## Key Features
- Real-time websocket data streaming
- 3D data visualization using Three.js
- Custom neural network topology explorable graphs

## Tech Stack
- React
- Python
- Three.js
- WebSockets
      `,
      techStack: ['React', 'Python', 'Three.js', 'AI'],
      features: ['Real-time Visualization', '3D Graphs', 'Dark Mode'],
      image: '/seed-assets/p1.png', // futuristic AI dashboard
      category: 'AI & Data',
      demoLink: 'https://example.com/demo/ai',
      githubLink: 'https://github.com/example/ai-dash',
    },
    {
      slug: 'modern-ecommerce',
      title: 'Lumina E-commerce',
      description: 'A minimal, high-performance e-commerce solution built with Next.js and Stripe.',
      fullDescription: `
# Lumina E-commerce

A next-generation e-commerce platform focused on speed and conversion.

## Architecture
Built on Next.js 14 using Server Components for maximum SEO and performance.

## Design
Implements a strict design system with fluid typography and spacing.
      `,
      techStack: ['Next.js', 'Stripe', 'Tailwind', 'PostgreSQL'],
      features: ['Server Actions', 'Streaming UI', 'One-click checkout'],
      image: '/seed-assets/p2.png', // modern e-commerce UI
      category: 'Web App',
      demoLink: 'https://example.com/demo/shop',
      githubLink: 'https://github.com/example/shop',
    },
    {
      slug: 'eco-track-mobile',
      title: 'EcoTrack Mobile',
      description: 'Mobile application for tracking personal carbon footprint with gamification elements.',
      fullDescription: `
# EcoTrack

Tracking your environmental impact shouldn't be a chore.

## Gamification
Earn badges and compete with friends to lower your carbon footprint.

## Integration
Connects with smart home devices to automatically track energy usage.
      `,
      techStack: ['React Native', 'Node.js', 'Firebase', 'IoT'],
      features: ['Cross-platform', 'Real-time Sync', 'Social Sharing'],
      image: '/seed-assets/p3.png', // environmental tracking app
      category: 'Mobile',
      demoLink: 'https://example.com/demo/eco',
      githubLink: 'https://github.com/example/eco',
    },
  ]

  for (const p of projects) {
    const exists = await prisma.project.findUnique({ where: { slug: p.slug } })
    if (!exists) {
      await prisma.project.create({
        data: {
          ...p,
          authorId: user!.id,
          published: true,
        },
      })
    }
  }

  // 4. Seed Blog Posts
  console.log('Seeding blog posts...')

  const posts = [
    {
      slug: 'future-of-ai-web-dev',
      title: 'The Future of AI in Web Development',
      description: 'How Generative AI is reshaping the landscape of frontend engineering and design workflows.',
      content: `
# The Future is Now

Artificial Intelligence is no longer just a buzzword; it's a daily tool for modern developers.

## Co-pilot and Beyond
Tools like GitHub Copilot are just the beginning. Imagine agents that can refactor entire codebases or generate unit tests automatically.

## Design to Code
The gap between Figma and React is closing rapidly. AI can now inspect visual designs and output semantic, accessible code.
      `,
      category: 'Tech',
      coverImage: '/seed-assets/b1.png', // abstract programming code
      tags: ['AI', 'Web Dev', 'Future', 'Opinion'],
    },
    {
      slug: 'minimalist-desk-setup',
      title: 'Guide to a Minimalist Developer Desk',
      description: 'Creating a workspace that fosters focus, creativity, and calm.',
      content: `
# Less is More

A cluttered desk leads to a cluttered mind. Here is my philosophy on creating the perfect dev environment.

## The Essentials
- A good mechanical keyboard
- Ergonomic chair
- Ambient lighting

## Cable Management
The unsung hero of a clean setup.
      `,
      category: 'Life',
      coverImage: '/seed-assets/b2.png', // minimalist developer desk
      tags: ['Productivity', 'Workspace', 'Minimalism'],
    },
    {
      slug: 'cyberpunk-ui-aesthetics',
      title: 'Exploring Cyberpunk Aesthetics in UI',
      description: 'Why neon visuals, glitch effects, and dark modes are making a comeback.',
      content: `
# High Tech, Low Life

The cyberpunk aesthetic allows for bold design choices that break standard corporate UI rules.

## Key Elements
- **Neon Colors**: High saturation, high contrast.
- **Glitch Effects**: CSS animations that simulate signal interference.
- **Grid Systems**: Exposed layout grids that look techy.

## Implementation
Using CSS mix-blend-mode and custom SVG filters to achieve the look.
      `,
      category: 'Design',
      coverImage: '/seed-assets/b3.png', // cyberpunk city
      tags: ['UI/UX', 'Design', 'Cyberpunk', 'CSS'],
    },
  ]

  for (const post of posts) {
    const exists = await prisma.post.findUnique({ where: { slug: post.slug } })
    if (!exists) {
      await prisma.post.create({
        data: {
          ...post,
          published: true,
          authorId: user!.id,
        },
      })
    }
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
