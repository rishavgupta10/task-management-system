import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { TaskStatus, TaskPriority } from '@prisma/client';

describe('Tasks API (Controller & Validation Integration)', () => {
  let app: INestApplication;

  // In-memory mock database for repeatable tests isolated from developer's DB
  const mockTasks = new Map<string, any>();

  const mockPrismaService = {
    task: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        let items = Array.from(mockTasks.values());
        if (where?.id) {
          items = items.filter((t) => t.id === where.id);
        }
        if (where?.title) {
          items = items.filter(
            (t) =>
              t.title === where.title &&
              (!where.status || t.status === where.status) &&
              (!where.priority || t.priority === where.priority),
          );
        }
        return Promise.resolve(items[0] || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const id = 'task-uuid-' + Math.random().toString(36).substring(2, 9);
        const task = {
          id,
          title: data.title,
          description: data.description || null,
          status: data.status || TaskStatus.TODO,
          priority: data.priority || TaskPriority.MEDIUM,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockTasks.set(id, task);
        return Promise.resolve(task);
      }),
      findMany: jest.fn().mockImplementation(({ where, skip, take, orderBy }) => {
        let items = Array.from(mockTasks.values());

        if (where?.title?.contains) {
          const search = where.title.contains.toLowerCase();
          items = items.filter((t) => t.title.toLowerCase().includes(search));
        }

        if (where?.status) {
          items = items.filter((t) => t.status === where.status);
        }

        if (where?.priority) {
          items = items.filter((t) => t.priority === where.priority);
        }

        const start = skip || 0;
        const limit = take || items.length;
        return Promise.resolve(items.slice(start, start + limit));
      }),
      count: jest.fn().mockImplementation(({ where }) => {
        let items = Array.from(mockTasks.values());

        if (where?.title?.contains) {
          const search = where.title.contains.toLowerCase();
          items = items.filter((t) => t.title.toLowerCase().includes(search));
        }

        if (where?.status) {
          items = items.filter((t) => t.status === where.status);
        }

        if (where?.priority) {
          items = items.filter((t) => t.priority === where.priority);
        }

        return Promise.resolve(items.length);
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockTasks.get(where.id) || null);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const existing = mockTasks.get(where.id);
        if (!existing) return Promise.resolve(null);
        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        mockTasks.set(where.id, updated);
        return Promise.resolve(updated);
      }),
      delete: jest.fn().mockImplementation(({ where }) => {
        const existing = mockTasks.get(where.id);
        mockTasks.delete(where.id);
        return Promise.resolve(existing);
      }),
    },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockTasks.clear();
  });

  // Test 1 — Invalid/Missing Title
  describe('POST /tasks validation', () => {
    it('should return 400 when title is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          description: 'No title provided',
        });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.message).toContain('Title');
    });

    it('should return 400 when title is empty string', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: '',
          description: 'Empty title provided',
        });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when status is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Valid title',
          status: 'INVALID_STATUS',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when priority is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Valid title',
          priority: 'SUPER_URGENT',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should create a valid task with 201 Created and defaults', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Fix login bug',
          description: 'Fix JWT refresh issue',
          priority: 'HIGH',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Fix login bug');
      expect(res.body.description).toBe('Fix JWT refresh issue');
      expect(res.body.status).toBe('TODO');
      expect(res.body.priority).toBe('HIGH');
    });
  });

  // Test 2 — Non-existing Task Update
  describe('PATCH /tasks/:id', () => {
    it('should return 404 when updating a non-existing task', async () => {
      const res = await request(app.getHttpServer())
        .patch('/tasks/non-existing-uuid-1234')
        .send({
          status: 'DONE',
        });

      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
      expect(res.body.message).toContain('not found');
    });

    it('should successfully update an existing task', async () => {
      // create task
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Original Title',
          status: 'TODO',
        });

      const taskId = createRes.body.id;

      // update task
      const updateRes = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .send({
          title: 'Updated Title',
          status: 'IN_PROGRESS',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe('Updated Title');
      expect(updateRes.body.status).toBe('IN_PROGRESS');
    });
  });

  // Test 3 — Status Filter
  describe('GET /tasks?status=...', () => {
    it('should filter tasks by status properly', async () => {
      // Populate tasks
      await request(app.getHttpServer()).post('/tasks').send({ title: 'Task 1', status: 'TODO' });
      await request(app.getHttpServer()).post('/tasks').send({ title: 'Task 2', status: 'DONE' });
      await request(app.getHttpServer()).post('/tasks').send({ title: 'Task 3', status: 'DONE' });
      await request(app.getHttpServer()).post('/tasks').send({ title: 'Task 4', status: 'IN_PROGRESS' });

      const res = await request(app.getHttpServer())
        .get('/tasks?status=DONE');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every((t: any) => t.status === 'DONE')).toBe(true);
      expect(res.body.meta.total).toBe(2);
    });
  });

  // Test 4 — Pagination
  describe('GET /tasks pagination', () => {
    it('should return correct page metadata and limited records', async () => {
      // Create 12 tasks
      for (let i = 1; i <= 12; i++) {
        await request(app.getHttpServer())
          .post('/tasks')
          .send({ title: `Batch Task ${i}`, priority: 'MEDIUM' });
      }

      const res = await request(app.getHttpServer())
        .get('/tasks?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(5);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
      expect(res.body.meta.total).toBe(12);
      expect(res.body.meta.totalPages).toBe(3);

      const resPage2 = await request(app.getHttpServer())
        .get('/tasks?page=2&limit=5');

      expect(resPage2.status).toBe(200);
      expect(resPage2.body.data.length).toBe(5);
      expect(resPage2.body.meta.page).toBe(2);
    });

    it('should reject invalid pagination parameters', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks?page=0&limit=500');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  // Test 5 — Title Search
  describe('GET /tasks?search=...', () => {
    it('should return matching tasks by title', async () => {
      await request(app.getHttpServer()).post('/tasks').send({ title: 'Fix login bug' });
      await request(app.getHttpServer()).post('/tasks').send({ title: 'Design login screen' });
      await request(app.getHttpServer()).post('/tasks').send({ title: 'Deploy PostgreSQL DB' });

      const res = await request(app.getHttpServer())
        .get('/tasks?search=login');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every((t: any) => t.title.toLowerCase().includes('login'))).toBe(true);
    });
  });

  // GET /tasks/:id & DELETE /tasks/:id
  describe('GET /tasks/:id and DELETE /tasks/:id', () => {
    it('should retrieve task by id or return 404', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Single task lookup' });

      const getRes = await request(app.getHttpServer())
        .get(`/tasks/${createRes.body.id}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.title).toBe('Single task lookup');

      const notFoundRes = await request(app.getHttpServer())
        .get('/tasks/unknown-id');

      expect(notFoundRes.status).toBe(404);
      expect(notFoundRes.body.error).toBe('NOT_FOUND');
    });

    it('should delete task with 204 or return 404 for missing task', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'To be deleted' });

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${createRes.body.id}`);

      expect(deleteRes.status).toBe(204);

      // Verify task is gone
      const verifyRes = await request(app.getHttpServer())
        .get(`/tasks/${createRes.body.id}`);

      expect(verifyRes.status).toBe(404);

      // Deleting again should return 404
      const deleteAgainRes = await request(app.getHttpServer())
        .delete(`/tasks/${createRes.body.id}`);

      expect(deleteAgainRes.status).toBe(404);
    });
  });
});
