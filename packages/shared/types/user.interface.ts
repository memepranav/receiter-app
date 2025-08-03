export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  country?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface UserProgress {
  userId: string;
  totalJuzCompleted: number;
  currentJuz: number;
  totalPoints: number;
  totalRecitations: number;
  weeklyStreak: number;
  monthlyStreak: number;
  achievements: string[];
  lastRecitationDate: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalRecitations: number;
  averageProgress: number;
}