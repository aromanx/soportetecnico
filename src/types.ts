export interface User {
  id?: number;
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}

export interface Provider {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface Ticket {
  id?: number;
  idc: string;
  providerId: number;
  caseNumber: string;
  client: string;
  locationId: number;
  serviceDate: string;
  startTime: string;
  endTime: string;
  createdAt?: Date;
  userId: number;
  userEmail: string;
} 