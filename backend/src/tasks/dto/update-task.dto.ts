import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty when provided' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsString({ message: 'expectedUpdatedAt must be an ISO date string' })
  expectedUpdatedAt?: string;
}
