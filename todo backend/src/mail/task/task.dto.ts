export class CreateTaskDto {
  title!: string;
  dueDate!: string;
  creatorEmail!: string;
  assignedToEmail!: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  dueDate: string;
  creatorEmail: string;
  assignedToEmail: string;
  status: 'Pending' | 'Completed';
  createdAt: Date;
}