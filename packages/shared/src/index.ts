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

export interface TestCampaignDTO {
  id: string;
  targetUrl: string;
  rewardAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
}
