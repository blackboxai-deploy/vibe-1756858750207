export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  teams: string[];
  lastSeen: Date;
  isOnline: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  projects: string[];
  createdAt: Date;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  teamId: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate?: Date;
  progress: number;
  tasks: string[];
  files: string[];
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  attachments: string[];
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  type: 'text' | 'file' | 'system';
  timestamp: Date;
  readBy: ReadReceipt[];
  attachments?: FileAttachment[];
  edited?: boolean;
  editedAt?: Date;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project';
  participants: string[];
  projectId?: string;
  teamId?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaderId: string;
  uploadedAt: Date;
  projectId?: string;
  taskId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'message' | 'project_update' | 'file_shared' | 'mention';
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  messages: Message[];
  channels: Channel[];
  files: FileAttachment[];
  notifications: Notification[];
  activeChannel?: string;
  activeProject?: string;
  sidebarCollapsed: boolean;
}

export type AppAction = 
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'MARK_MESSAGE_READ'; payload: { messageId: string; userId: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_ACTIVE_CHANNEL'; payload: string }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string }
  | { type: 'TOGGLE_SIDEBAR'; payload?: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_FILE'; payload: FileAttachment }
  | { type: 'ADD_TEAM'; payload: Team };