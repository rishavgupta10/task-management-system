import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Headers('x-organization-id') tenantId?: string,
  ) {
    return this.tasksService.create(createTaskDto, idempotencyKey, tenantId);
  }

  @Get()
  findAll(
    @Query() query: QueryTasksDto,
    @Headers('x-organization-id') tenantId?: string,
  ) {
    return this.tasksService.findAll(query, tenantId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-organization-id') tenantId?: string,
  ) {
    return this.tasksService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Headers('x-organization-id') tenantId?: string,
  ) {
    return this.tasksService.update(id, updateTaskDto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Headers('x-organization-id') tenantId?: string,
  ) {
    await this.tasksService.remove(id, tenantId);
  }
}
