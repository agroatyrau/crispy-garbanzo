import { User, InsertUser, Task, Submission } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTasks(): Promise<Task[]>;
  getSubmissions(userId?: number): Promise<Submission[]>;
  createSubmission(submission: Omit<Submission, "id">): Promise<Submission>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private submissions: Map<number, Submission>;
  private currentIds: { users: number; tasks: number; submissions: number };
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.submissions = new Map();
    this.currentIds = { users: 1, tasks: 1, submissions: 1 };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add sample tasks
    this.tasks.set(1, {
      id: 1,
      title: "Сортировка массива",
      description: "Реализуйте алгоритм сортировки массива.",
      points: 100,
    });
    this.tasks.set(2, {
      id: 2,
      title: "Поиск подстроки",
      description: "Напишите функцию поиска подстроки в строке.",
      points: 150,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getSubmissions(userId?: number): Promise<Submission[]> {
    const submissions = Array.from(this.submissions.values());
    return userId 
      ? submissions.filter(sub => sub.userId === userId)
      : submissions;
  }

  async createSubmission(submission: Omit<Submission, "id">): Promise<Submission> {
    const id = this.currentIds.submissions++;
    const newSubmission: Submission = { ...submission, id };
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }
}

export const storage = new MemStorage();
