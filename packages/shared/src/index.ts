export enum Role {
  OWNER = 'OWNER',
  TESTER = 'TESTER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  FUNDED = 'FUNDED',
  COMPLETED = 'COMPLETED'
}

export enum JobStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface UserDTO {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponseDTO {
  token: string;
  user: UserDTO;
}

export interface TaskDTO {
  id: string;
  stepOrder: number;
  instruction: string;
}

export interface CreateCampaignDTO {
  targetUrl: string;
  rewardAmount: number;
  tasks: Omit<TaskDTO, 'id'>[];
}

export interface TestCampaignDTO {
  id: string;
  targetUrl: string;
  rewardAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  tasks: TaskDTO[];
  jobs: JobAssignmentDTO[];
}

export interface JobAssignmentDTO {
  id: string;
  campaignId: string;
  testerId: string | null;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResponseInputDTO {
  taskId: string;
  answerText: string;
}

export interface SubmitJobDTO {
  responses: TaskResponseInputDTO[];
}
