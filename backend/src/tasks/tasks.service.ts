import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title.trim(),
        description: createTaskDto.description?.trim(),
        status: createTaskDto.status,
        priority: createTaskDto.priority,
      },
    });
  }

  async findAll(query: QueryTasksDto) {
    const { search, status, priority, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

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

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // Check if task exists first to guarantee 404
    await this.findOne(id);

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

  async remove(id: string) {
    // Check if task exists first to guarantee 404
    await this.findOne(id);

    await this.prisma.task.delete({
      where: { id },
    });
  }
}
