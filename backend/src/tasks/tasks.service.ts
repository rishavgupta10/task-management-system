import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  // In-memory cache for idempotency keys (stores response with TTL)
  private readonly idempotencyCache = new Map<string, { task: any; timestamp: number }>();

  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, idempotencyKey?: string, tenantId: string = 'org_default') {
    const now = Date.now();
    const cacheKey = `${tenantId}:${idempotencyKey || ''}`;

    // 1. Check if Idempotency-Key was provided and cached recently (within 5 minutes)
    if (idempotencyKey) {
      const cached = this.idempotencyCache.get(cacheKey);
      if (cached && now - cached.timestamp < 5 * 60 * 1000) {
        return cached.task;
      }
    }

    // 2. Also check if an identical task was created in the last 15 seconds (detect retry bursts)
    const recentDuplicate = await this.prisma.task.findFirst({
      where: {
        organizationId: tenantId,
        title: createTaskDto.title.trim(),
        description: createTaskDto.description?.trim() || null,
        status: createTaskDto.status || 'TODO',
        priority: createTaskDto.priority || 'MEDIUM',
        createdAt: {
          gte: new Date(now - 15 * 1000), // last 15 seconds
        },
      },
    });

    if (recentDuplicate) {
      if (idempotencyKey) {
        this.idempotencyCache.set(cacheKey, { task: recentDuplicate, timestamp: now });
      }
      return recentDuplicate;
    }

    // 3. Create the task safely scoped to this tenant
    const createdTask = await this.prisma.task.create({
      data: {
        organizationId: tenantId,
        title: createTaskDto.title.trim(),
        description: createTaskDto.description?.trim(),
        status: createTaskDto.status,
        priority: createTaskDto.priority,
      },
    });

    if (idempotencyKey) {
      this.idempotencyCache.set(cacheKey, { task: createdTask, timestamp: now });
    }

    return createdTask;
  }

  async findAll(query: QueryTasksDto, tenantId: string = 'org_default') {
    const { search, status, priority, page = 1, limit = 10, cursor } = query;
    const take = Number(limit);

    // Multi-tenant isolation: always enforce tenantId filter
    const where: Prisma.TaskWhereInput = {
      organizationId: tenantId,
    };

    if (search && search.trim() !== '') {
      where.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    // High performance cursor / keyset query if cursor is supplied
    if (cursor) {
      const data = await this.prisma.task.findMany({
        where,
        take: take + 1, // peek next record for hasMore flag
        cursor: { id: cursor },
        skip: 1, // skip the cursor record itself
        orderBy: {
          createdAt: 'desc',
        },
      });

      const hasMore = data.length > take;
      const results = hasMore ? data.slice(0, take) : data;
      const nextCursor = hasMore && results.length > 0 ? results[results.length - 1].id : null;

      return {
        data: results,
        meta: {
          page: Number(page),
          limit: take,
          nextCursor,
          hasMore,
        },
      };
    }

    // Standard indexed offset query for UI pagination with parallel count
    const skip = (Number(page) - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data,
      meta: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
        nextCursor: data.length > 0 ? data[data.length - 1].id : null,
      },
    };
  }

  async findOne(id: string, tenantId: string = 'org_default') {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        organizationId: tenantId,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, tenantId: string = 'org_default') {
    // Check if task exists for this specific tenant first
    const existingTask = await this.findOne(id, tenantId);

    // Optimistic Concurrency Control:
    if (
      updateTaskDto.expectedUpdatedAt &&
      new Date(existingTask.updatedAt).getTime() !== new Date(updateTaskDto.expectedUpdatedAt).getTime()
    ) {
      throw new ConflictException(
        'Concurrent update conflict: This task has been modified by another user. Please reload the latest changes before saving.',
      );
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(updateTaskDto.title !== undefined ? { title: updateTaskDto.title.trim() } : {}),
        ...(updateTaskDto.description !== undefined ? { description: updateTaskDto.description?.trim() } : {}),
        ...(updateTaskDto.status !== undefined ? { status: updateTaskDto.status } : {}),
        ...(updateTaskDto.priority !== undefined ? { priority: updateTaskDto.priority } : {}),
      },
    });
  }

  async remove(id: string, tenantId: string = 'org_default') {
    // Verify task belongs to this tenant before deleting
    await this.findOne(id, tenantId);

    await this.prisma.task.delete({
      where: { id },
    });
  }
}
