import { 
  type Worker, type InsertWorker,
  type Attendance, type InsertAttendance,
  type Customer, type InsertCustomer,
  type SalesOrder, type InsertSalesOrder,
  type Inventory,
  type InventoryMovement, type InsertInventoryMovement,
  type Payment, type InsertPayment,
  type WeeklySummary, type InsertWeeklySummary,
  type AdvancePayment, type InsertAdvancePayment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Workers
  getWorkers(): Promise<Worker[]>;
  getWorker(id: string): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: string, updates: Partial<Worker>): Promise<Worker>;
  deleteWorker(id: string): Promise<void>;

  // Attendance
  getAttendance(date?: string): Promise<Attendance[]>;
  getWorkerAttendance(workerId: string, weekStart: string, weekEnd: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>;

  // Sales Orders
  getSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: string, updates: Partial<SalesOrder>): Promise<SalesOrder>;

  // Inventory
  getInventory(): Promise<Inventory>;
  updateInventory(updates: Partial<Inventory>): Promise<Inventory>;
  getInventoryMovements(limit?: number): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;

  // Payments
  getPayments(workerId?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getWeeklySummary(workerId: string, weekStart: string): Promise<WeeklySummary | undefined>;
  createWeeklySummary(summary: InsertWeeklySummary): Promise<WeeklySummary>;
  updateWeeklySummary(id: string, updates: Partial<WeeklySummary>): Promise<WeeklySummary>;

  // Advance Payments
  getAdvancePayments(workerId?: string): Promise<AdvancePayment[]>;
  createAdvancePayment(advance: InsertAdvancePayment): Promise<AdvancePayment>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalWorkers: number;
    todayAttendance: { present: number; total: number };
    weeklyProduction: number;
    inventoryLevel: number;
    pendingPayments: number;
    recentOrders: SalesOrder[];
  }>;
}

export class MemStorage implements IStorage {
  private workers: Map<string, Worker> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private customers: Map<string, Customer> = new Map();
  private salesOrders: Map<string, SalesOrder> = new Map();
  private inventory: Inventory;
  private inventoryMovements: Map<string, InventoryMovement> = new Map();
  private payments: Map<string, Payment> = new Map();
  private weeklySummaries: Map<string, WeeklySummary> = new Map();
  private advancePayments: Map<string, AdvancePayment> = new Map();

  constructor() {
    // Initialize with starting inventory
    this.inventory = {
      id: randomUUID(),
      currentStock: 1100000, // Starting with 1.1 million bricks
      khangerStock: 0,
      lastUpdated: new Date(),
    };
  }

  // Workers
  async getWorkers(): Promise<Worker[]> {
    return Array.from(this.workers.values());
  }

  async getWorker(id: string): Promise<Worker | undefined> {
    return this.workers.get(id);
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const id = randomUUID();
    const worker: Worker = { 
      ...insertWorker, 
      id, 
      balance: "0",
      isActive: true,
      dailyWage: insertWorker.dailyWage ?? null,
      pieceRate: insertWorker.pieceRate ?? null,
      phone: insertWorker.phone ?? null,
      address: insertWorker.address ?? null,
    };
    this.workers.set(id, worker);
    return worker;
  }

  async updateWorker(id: string, updates: Partial<Worker>): Promise<Worker> {
    const worker = this.workers.get(id);
    if (!worker) throw new Error("Worker not found");
    const updated = { ...worker, ...updates };
    this.workers.set(id, updated);
    return updated;
  }

  async deleteWorker(id: string): Promise<void> {
    this.workers.delete(id);
  }

  // Attendance
  async getAttendance(date?: string): Promise<Attendance[]> {
    const allAttendance = Array.from(this.attendance.values());
    if (date) {
      return allAttendance.filter(a => a.date === date);
    }
    return allAttendance;
  }

  async getWorkerAttendance(workerId: string, weekStart: string, weekEnd: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      a => a.workerId === workerId && a.date >= weekStart && a.date <= weekEnd
    );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = { 
      ...insertAttendance, 
      id,
      createdAt: new Date(),
      bricksProduced: insertAttendance.bricksProduced ?? null,
      notes: insertAttendance.notes ?? null,
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async upsertAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    // Check if attendance record already exists for this worker and date
    const existing = Array.from(this.attendance.values()).find(
      a => a.workerId === insertAttendance.workerId && a.date === insertAttendance.date
    );

    if (existing) {
      // Update existing record
      const updated: Attendance = {
        ...existing,
        isPresent: insertAttendance.isPresent,
        bricksProduced: insertAttendance.bricksProduced ?? null,
        notes: insertAttendance.notes ?? null,
      };
      this.attendance.set(existing.id, updated);
      return updated;
    } else {
      // Create new record
      return this.createAttendance(insertAttendance);
    }
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    const attendance = this.attendance.get(id);
    if (!attendance) throw new Error("Attendance record not found");
    const updated = { ...attendance, ...updates };
    this.attendance.set(id, updated);
    return updated;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      totalOrders: 0,
      lastOrderDate: null,
      createdAt: new Date(),
      phone: insertCustomer.phone ?? null,
      address: insertCustomer.address ?? null,
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) throw new Error("Customer not found");
    const updated = { ...customer, ...updates };
    this.customers.set(id, updated);
    return updated;
  }

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    return Array.from(this.salesOrders.values());
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    return this.salesOrders.get(id);
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const id = randomUUID();
    const orderCount = this.salesOrders.size + 1;
    const orderNumber = `ORD-${orderCount.toString().padStart(3, '0')}`;
    const totalAmount = (Number(insertOrder.ratePerBrick) * insertOrder.quantity).toFixed(2);
    
    const order: SalesOrder = { 
      ...insertOrder, 
      id,
      orderNumber,
      totalAmount,
      status: "pending",
      deliveryDate: null,
      createdAt: new Date(),
      notes: insertOrder.notes ?? null,
    };
    this.salesOrders.set(id, order);

    // Update customer stats
    const customer = this.customers.get(insertOrder.customerId);
    if (customer) {
      await this.updateCustomer(insertOrder.customerId, {
        totalOrders: (customer.totalOrders ?? 0) + 1,
        lastOrderDate: insertOrder.orderDate
      });
    }

    return order;
  }

  async updateSalesOrder(id: string, updates: Partial<SalesOrder>): Promise<SalesOrder> {
    const order = this.salesOrders.get(id);
    if (!order) throw new Error("Sales order not found");
    const updated = { ...order, ...updates };
    this.salesOrders.set(id, updated);

    // If order is being delivered, update inventory
    if (updates.status === "delivered" && order.status !== "delivered") {
      await this.createInventoryMovement({
        type: "sale",
        quantity: -order.quantity,
        reason: `Sale to customer - Order ${order.orderNumber}`,
        referenceId: id
      });
      
      // Update inventory
      this.inventory.currentStock -= order.quantity;
      this.inventory.lastUpdated = new Date();
    }

    return updated;
  }

  // Inventory
  async getInventory(): Promise<Inventory> {
    return this.inventory;
  }

  async updateInventory(updates: Partial<Inventory>): Promise<Inventory> {
    this.inventory = { ...this.inventory, ...updates, lastUpdated: new Date() };
    return this.inventory;
  }

  async getInventoryMovements(limit = 50): Promise<InventoryMovement[]> {
    const movements = Array.from(this.inventoryMovements.values());
    return movements
      .sort((a, b) => (b.movementDate ? new Date(b.movementDate) : new Date()).getTime() - (a.movementDate ? new Date(a.movementDate) : new Date()).getTime())
      .slice(0, limit);
  }

  async createInventoryMovement(insertMovement: InsertInventoryMovement): Promise<InventoryMovement> {
    const id = randomUUID();
    const movement: InventoryMovement = { 
      ...insertMovement, 
      id,
      movementDate: new Date(),
      reason: insertMovement.reason ?? null,
      referenceId: insertMovement.referenceId ?? null,
    };
    this.inventoryMovements.set(id, movement);
    return movement;
  }

  // Payments
  async getPayments(workerId?: string): Promise<Payment[]> {
    const allPayments = Array.from(this.payments.values());
    if (workerId) {
      return allPayments.filter(p => p.workerId === workerId);
    }
    return allPayments;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      paymentDate: new Date(),
      daysWorked: insertPayment.daysWorked ?? null,
      bricksProduced: insertPayment.bricksProduced ?? null,
      notes: insertPayment.notes ?? null,
    };
    this.payments.set(id, payment);

    // Update worker balance - add remaining balance (debt), subtract if overpaid
    const worker = this.workers.get(insertPayment.workerId);
    if (worker) {
      const currentBalance = Number(worker.balance);
      const balanceAmount = Number(insertPayment.balanceAmount);
      const newBalance = currentBalance + balanceAmount;
      await this.updateWorker(insertPayment.workerId, { balance: newBalance.toString() });
    }

    return payment;
  }

  async getWeeklySummary(workerId: string, weekStart: string): Promise<WeeklySummary | undefined> {
    return Array.from(this.weeklySummaries.values()).find(
      s => s.workerId === workerId && s.weekStartDate === weekStart
    );
  }

  async createWeeklySummary(insertSummary: InsertWeeklySummary): Promise<WeeklySummary> {
    const id = randomUUID();
    const summary: WeeklySummary = { 
      ...insertSummary, 
      id,
      daysWorked: insertSummary.daysWorked ?? null,
      bricksProduced: insertSummary.bricksProduced ?? null,
      grossEarnings: insertSummary.grossEarnings ?? null,
      isCalculated: insertSummary.isCalculated ?? null,
    };
    this.weeklySummaries.set(id, summary);
    return summary;
  }

  async updateWeeklySummary(id: string, updates: Partial<WeeklySummary>): Promise<WeeklySummary> {
    const summary = this.weeklySummaries.get(id);
    if (!summary) throw new Error("Weekly summary not found");
    const updated = { ...summary, ...updates };
    this.weeklySummaries.set(id, updated);
    return updated;
  }

  // Advance Payments
  async getAdvancePayments(workerId?: string): Promise<AdvancePayment[]> {
    const allAdvances = Array.from(this.advancePayments.values());
    if (workerId) {
      return allAdvances.filter(a => a.workerId === workerId);
    }
    return allAdvances;
  }

  async createAdvancePayment(insertAdvance: InsertAdvancePayment): Promise<AdvancePayment> {
    const id = randomUUID();
    const advance: AdvancePayment = { 
      ...insertAdvance, 
      id,
      paymentDate: new Date(),
      reason: insertAdvance.reason ?? null,
      notes: insertAdvance.notes ?? null,
    };
    this.advancePayments.set(id, advance);

    // Update worker balance - advance reduces their balance (negative = they owe money back)
    const worker = this.workers.get(insertAdvance.workerId);
    if (worker) {
      const currentBalance = Number(worker.balance);
      const advanceAmount = Number(insertAdvance.amount);
      const newBalance = currentBalance - advanceAmount;
      await this.updateWorker(insertAdvance.workerId, { balance: newBalance.toString() });
    }

    return advance;
  }

  // Dashboard metrics
  async getDashboardMetrics() {
    const workers = await this.getWorkers();
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await this.getAttendance(today);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    const weeklyAttendance = Array.from(this.attendance.values()).filter(
      a => a.date >= weekStart.toISOString().split('T')[0] && 
           a.date <= weekEnd.toISOString().split('T')[0] &&
           a.isPresent
    );
    
    const weeklyProduction = weeklyAttendance.reduce((sum, a) => sum + (a.bricksProduced || 0), 0);
    
    const recentOrders = Array.from(this.salesOrders.values())
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt) : new Date()).getTime() - (a.createdAt ? new Date(a.createdAt) : new Date()).getTime())
      .slice(0, 5);

    return {
      totalWorkers: workers.length,
      todayAttendance: {
        present: todayAttendance.filter(a => a.isPresent).length,
        total: workers.length
      },
      weeklyProduction,
      inventoryLevel: this.inventory.currentStock,
      pendingPayments: 0, // Calculate based on unpaid amounts
      recentOrders
    };
  }
}

export const storage = new MemStorage();
