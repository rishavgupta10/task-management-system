import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial tasks...');

  await prisma.task.deleteMany({});

  const sampleTasks = [
    {
      title: 'Fix login bug',
      description: 'Fix JWT refresh token expiration handling on mobile web clients.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Implement search endpoint',
      description: 'Add server-side title search using case-insensitive PostgreSQL query.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Design database schema',
      description: 'Create PostgreSQL Prisma schema with appropriate indexes for status and priority.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Setup Docker Compose',
      description: 'Configure multi-container orchestration for backend, frontend, and PostgreSQL.',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Configure CORS settings',
      description: 'Restrict allowed origins dynamically based on NODE_ENV and CORS_ORIGIN.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Write automated API tests',
      description: 'Cover missing title validation, 404 updates, status filters, and pagination.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Optimize SQL indexing',
      description: 'Add compound indexes on tasks table to maintain sub-10ms queries for 100k items.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Refactor modal forms',
      description: 'Unify Task create and edit modals into a reusable and accessible dialog component.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
    },
    {
      title: 'Set up rate limiting',
      description: 'Protect public API endpoints against denial-of-service and brute force requests.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
    },
    {
      title: 'Implement optimistic locking',
      description: 'Prepare versioning and conflict detection for concurrent task updates.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Add health check endpoint',
      description: 'Provide GET /health endpoint returning system status and uptime timestamp.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
    },
    {
      title: 'Test pagination edge cases',
      description: 'Verify page limits, negative parameters, and total pages calculations.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Setup Next.js responsive layout',
      description: 'Ensure clean navigation and responsive task cards for desktop and mobile viewports.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Document deployment process',
      description: 'Draft comprehensive README detailing live deployment steps on Render/Vercel.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Verify error boundary and toast alerts',
      description: 'Ensure network failure triggers retry action and non-blocking toast notifications.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
    },
  ];

  for (const task of sampleTasks) {
    await prisma.task.create({
      data: task,
    });
  }

  const count = await prisma.task.count();
  console.log(`Seeding finished. Inserted ${count} sample tasks.`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
