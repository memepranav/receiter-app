export interface Recitation {
  _id: string;
  userId: string;
  juzNumber: number;
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
  audioFileUrl?: string;
  duration: number; // in seconds
  accuracy: number; // percentage
  points: number;
  status: RecitationStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum RecitationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export interface CreateRecitationDto {
  juzNumber: number;
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
  audioFile?: Express.Multer.File;
  duration: number;
}

export interface RecitationStats {
  totalRecitations: number;
  pendingReviews: number;
  approvedToday: number;
  averageAccuracy: number;
  topPerformers: {
    userId: string;
    username: string;
    totalPoints: number;
  }[];
}