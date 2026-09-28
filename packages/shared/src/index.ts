export enum Role {
  OWNER = 'OWNER',
  TESTER = 'TESTER'
}

export enum TaskType {
  FREE_RESPONSE = 'FREE_RESPONSE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RATING_SCALE = 'RATING_SCALE',
}

export interface StructuredAnswerMultipleChoice {
  type: TaskType.MULTIPLE_CHOICE;
  value: string; // The selected choice text
}

export interface StructuredAnswerRatingScale {
  type: TaskType.RATING_SCALE;
  value: number; // The numeric rating
}

export type StructuredAnswer = StructuredAnswerMultipleChoice | StructuredAnswerRatingScale;

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
  maxTimeLimit: number;
  taskType: TaskType;
  // MULTIPLE_CHOICE fields
  choices: string[];
  // RATING_SCALE fields
  ratingMin: number | null;
  ratingMax: number | null;
  ratingMinLabel: string | null;
  ratingMaxLabel: string | null;
}

export interface CreateTaskDTO {
  instruction: string;
  maxTimeLimit?: number;
  taskType?: TaskType;
  // MULTIPLE_CHOICE
  choices?: string[];
  // RATING_SCALE
  ratingMin?: number;
  ratingMax?: number;
  ratingMinLabel?: string;
  ratingMaxLabel?: string;
}

export interface CreateCampaignDTO {
  targetUrl: string;
  rewardAmount: number;
  testerCount: number;
  scenario?: string;
  tasks: CreateTaskDTO[];
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
