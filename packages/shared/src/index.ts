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
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  itExpertise?: string | null;
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
  testerCount: number;
  scenario?: string;
  tasks: Array<{ instruction: string, maxTimeLimit?: number }>;
  targetMinAge?: number;
  targetMaxAge?: number;
  targetGenders?: string[];
  targetItExpertises?: string[];
}

export interface TestCampaignDTO {
  id: string;
  targetUrl: string;
  rewardAmount: number;
  testerCount: number;
  scenario?: string;
  isLocked: boolean;
  currency: string;
  paymentStatus: PaymentStatus;
  tasks: TaskDTO[];
  jobs: JobAssignmentDTO[];
  targetMinAge?: number | null;
  targetMaxAge?: number | null;
  targetGenders?: string[];
  targetItExpertises?: string[];
}

export interface JobAssignmentDTO {
  id: string;
  campaignId: string;
  testerId: string | null;
  status: JobStatus;
  claimedAt?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskResponseInputDTO {
  taskId: string;
  answerText: string;
}

export interface SubmitJobDTO {
  responses: TaskResponseInputDTO[];
}
