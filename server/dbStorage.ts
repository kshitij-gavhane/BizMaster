import { 
  type Worker, type InsertWorker,
  type Attendance, type InsertAttendance,
  type Customer, type InsertCustomer,
  type SalesOrder, type InsertSalesOrder,
  type Inventory,
  type InventoryMovement, type InsertInventoryMovement,
  type Payment, type InsertPayment,
  type WeeklySummary, type InsertWeeklySummary,
  type AdvancePayment, type InsertAdvancePayment,
  type Trip, type InsertTrip,
  type TripParticipant, type InsertTripParticipant,
  type Note, type InsertNote,
  workers, attendance, customers, salesOrders, inventory, inventoryMovements, payments, weeklySummary, advancePayments,
  trips, tripParticipants, notes
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DatabaseStorage {
  // Workers
  async getWorkers(): Promise<Worker[]> {
    return await db.select().from(workers).where(eq(workers.isActive, true));
  }

  async getWorker(id: string): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.id, id));
    return result[0];
  }

  // Notes
  async getNotes(limit = 20): Promise<Note[]> {
    return await db.select().from(notes).orderBy(desc(notes.createdAt)).limit(limit);
  }

  async createNote(insert: InsertNote): Promise<Note> {
    const id = randomUUID();
    const n: Note = { ...insert, id, createdAt: new Date() } as unknown as Note;
    await db.insert(notes).values(n);
    return n;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  // Admin utilities
  async clearAdvancesAndResetBalances(): Promise<void> {
    // Delete all advance payment records
    await db.delete(advancePayments);
    // Reset all workers' balances to 0
    await db.update(workers).set({ balance: "0" });
  }

  async zeroOutAdvancesAndBalances(): Promise<void> {
    // Hard reset using SQL to ensure column-to-column update
    await db.execute(sql`update ${advancePayments} set adjusted_amount = amount;`);
    await db.execute(sql`update ${workers} set balance = '0';`);
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
    
    await db.insert(workers).values(worker);
    return worker;
  }

  async updateWorker(id: string, updates: Partial<Worker>): Promise<Worker> {
    const result = await db.update(workers)
      .set(updates)
      .where(eq(workers.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Worker not found");
    return result[0];
  }

  async deleteWorker(id: string): Promise<void> {
    await db.update(workers)
      .set({ isActive: false })
      .where(eq(workers.id, id));
  }

  // Attendance
  async getAttendance(date?: string): Promise<Attendance[]> {
    if (date) {
      return await db.select().from(attendance).where(eq(attendance.date, date));
    }
    return await db.select().from(attendance);
  }

  async getWorkerAttendance(workerId: string, weekStart: string, weekEnd: string): Promise<Attendance[]> {
    return await db.select()
      .from(attendance)
      .where(
        and(
          eq(attendance.workerId, workerId),
          gte(attendance.date, weekStart),
          lte(attendance.date, weekEnd)
        )
      );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendanceRecord: Attendance = { 
      ...insertAttendance, 
      id,
      createdAt: new Date(),
      bricksProduced: insertAttendance.bricksProduced ?? null,
      notes: insertAttendance.notes ?? null,
    };
    
    await db.insert(attendance).values(attendanceRecord);
    return attendanceRecord;
  }

  async upsertAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    // Check if attendance record already exists for this worker and date
    const existing = await db.select()
      .from(attendance)
      .where(
        and(
          eq(attendance.workerId, insertAttendance.workerId),
          eq(attendance.date, insertAttendance.date)
        )
      );

    if (existing[0]) {
      // Update existing record
      const updated: Attendance = {
        ...existing[0],
        isPresent: insertAttendance.isPresent,
        bricksProduced: insertAttendance.bricksProduced ?? null,
        notes: insertAttendance.notes ?? null,
      };
      
      await db.update(attendance)
        .set(updated)
        .where(eq(attendance.id, existing[0].id));
      
      return updated;
    } else {
      // Create new record
      return this.createAttendance(insertAttendance);
    }
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    const result = await db.update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Attendance record not found");
    return result[0];
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
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
    
    await db.insert(customers).values(customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const result = await db.update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Customer not found");
    return result[0];
  }

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const result = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return result[0];
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const id = randomUUID();
    const orderCount = await db.select({ count: salesOrders.id }).from(salesOrders);
    const orderNumber = `ORD-${(orderCount.length + 1).toString().padStart(3, '0')}`;
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
    
    await db.insert(salesOrders).values(order);

    // Update customer stats
    const customer = await this.getCustomer(insertOrder.customerId);
    if (customer) {
      await this.updateCustomer(insertOrder.customerId, {
        totalOrders: (customer.totalOrders ?? 0) + 1,
        lastOrderDate: insertOrder.orderDate
      });
    }

    return order;
  }

  async updateSalesOrder(id: string, updates: Partial<SalesOrder>): Promise<SalesOrder> {
    const result = await db.update(salesOrders)
      .set(updates)
      .where(eq(salesOrders.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Sales order not found");
    
    const order = result[0];

    // If order is being delivered, update inventory
    if (updates.status === "delivered" && order.status !== "delivered") {
      await this.createInventoryMovement({
        type: "sale",
        quantity: -order.quantity,
        reason: `Sale to customer - Order ${order.orderNumber}`,
        referenceId: id
      });
      
      // Update inventory
      const currentInventory = await this.getInventory();
      await this.updateInventory({ 
        currentStock: currentInventory.currentStock - order.quantity 
      });

      // If own fleet, create a trip linked to this sale
      if (order.ownFleet && order.driverWorkerId) {
        await this.createTripWithParticipants({
          driverId: order.driverWorkerId,
          tripDate: order.deliveryDate || new Date().toISOString().split('T')[0],
          vehicleType: order.vehicleType,
          amountPerTrip: "1000", // default; UI can set specific per-trip amounts later
          participantIds: [],
        } as any);
      }
    }

    return order;
  }

  // Inventory
  async getInventory(): Promise<Inventory> {
    const result = await db.select().from(inventory).limit(1);
    if (!result[0]) {
      // Create default inventory if none exists
      const defaultInventory: Inventory = {
        id: randomUUID(),
        currentStock: 1100000,
        khangerStock: 0,
        lastUpdated: new Date(),
      };
      await db.insert(inventory).values(defaultInventory);
      return defaultInventory;
    }
    return result[0];
  }

  async updateInventory(updates: Partial<Inventory>): Promise<Inventory> {
    const current = await this.getInventory();
    const updated = { ...current, ...updates, lastUpdated: new Date() };
    
    await db.update(inventory)
      .set(updated)
      .where(eq(inventory.id, current.id));
    
    return updated;
  }

  async getInventoryMovements(limit = 50): Promise<InventoryMovement[]> {
    return await db.select()
      .from(inventoryMovements)
      .orderBy(desc(inventoryMovements.movementDate))
      .limit(limit);
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
    
    await db.insert(inventoryMovements).values(movement);
    return movement;
  }

  // Payments
  async getPayments(workerId?: string): Promise<Payment[]> {
    if (workerId) {
      return await db.select().from(payments).where(eq(payments.workerId, workerId));
    }
    return await db.select().from(payments);
  }

  async createPayment(insertPayment: InsertPayment, applyAdvanceAmount?: number): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      paymentDate: new Date(),
      daysWorked: insertPayment.daysWorked ?? null,
      bricksProduced: insertPayment.bricksProduced ?? null,
      notes: insertPayment.notes ?? null,
    };
    
    await db.insert(payments).values(payment);

    // Apply outstanding advances against this payment's remaining balance, then update worker balance
    const worker = await this.getWorker(insertPayment.workerId);
    if (worker) {
      const remainingBalance = Math.max(0, Number(insertPayment.grossAmount) - Number(insertPayment.paidAmount));

      // Fetch advances with remaining amounts
      const advances = await db.select().from(advancePayments).where(eq(advancePayments.workerId, insertPayment.workerId));
      const advancesWithRemaining = advances
        .map(a => ({ ...a, remaining: Math.max(0, Number(a.amount) - Number(a.adjustedAmount || 0)) }))
        .filter(a => a.remaining > 0)
        .sort((a, b) => (a.paymentDate && b.paymentDate ? new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime() : 0));

      let balanceToCarry = remainingBalance;
      // If a specific advance amount is requested, allow adjusting even if remainingBalance is 0
      let toAdjust = typeof applyAdvanceAmount === 'number' ? Math.max(0, applyAdvanceAmount) : remainingBalance;

      for (const adv of advancesWithRemaining) {
        if (toAdjust <= 0) break;
        const use = Math.min(adv.remaining, toAdjust);
        const newAdjusted = (Number(adv.adjustedAmount || 0) + use).toFixed(2);
        await db.update(advancePayments)
          .set({ adjustedAmount: newAdjusted })
          .where(eq(advancePayments.id, adv.id));
        toAdjust -= use;
      }

      // Effective balance after using advances: remainingBalance minus the portion we successfully adjusted
      const adjustedTotal = (typeof applyAdvanceAmount === 'number'
        ? (Math.max(0, applyAdvanceAmount) - toAdjust)
        : (remainingBalance - toAdjust));
      balanceToCarry = remainingBalance - adjustedTotal;

      const currentBalance = Number(worker.balance);
      const newBalance = currentBalance + balanceToCarry;
      await this.updateWorker(insertPayment.workerId, { balance: newBalance.toString() });
    }

    return payment;
  }

  // Trips
  async getTrips(driverId?: string, weekStart?: string, weekEnd?: string): Promise<Trip[]> {
    let query = db.select().from(trips);
    // Simple filters; drizzle doesn't support dynamic where easily, so branch
    if (driverId && weekStart && weekEnd) {
      return await db.select().from(trips).where(and(eq(trips.driverId, driverId), gte(trips.tripDate, weekStart), lte(trips.tripDate, weekEnd)));
    }
    if (driverId) {
      return await db.select().from(trips).where(eq(trips.driverId, driverId));
    }
    return await query;
  }

  async createTripWithParticipants(data: InsertTrip & { participantIds: string[] }): Promise<{ trip: Trip; participants: TripParticipant[] }> {
    const id = randomUUID();
    const trip: Trip = {
      ...data,
      id,
      createdAt: new Date(),
    } as unknown as Trip;
    await db.insert(trips).values(trip);

    const participants: TripParticipant[] = [];
    for (const workerId of data.participantIds) {
      const pid = randomUUID();
      const participant: TripParticipant = { id: pid, tripId: id, workerId } as TripParticipant;
      participants.push(participant);
    }
    if (participants.length > 0) {
      await db.insert(tripParticipants).values(participants);
    }
    return { trip, participants };
  }

  async getWeeklySummary(workerId: string, weekStart: string): Promise<WeeklySummary | undefined> {
    const result = await db.select()
      .from(weeklySummary)
      .where(
        and(
          eq(weeklySummary.workerId, workerId),
          eq(weeklySummary.weekStartDate, weekStart)
        )
      );
    return result[0];
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
    
    await db.insert(weeklySummary).values(summary);
    return summary;
  }

  async updateWeeklySummary(id: string, updates: Partial<WeeklySummary>): Promise<WeeklySummary> {
    const result = await db.update(weeklySummary)
      .set(updates)
      .where(eq(weeklySummary.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Weekly summary not found");
    return result[0];
  }

  // Advance Payments
  async getAdvancePayments(workerId?: string): Promise<AdvancePayment[]> {
    if (workerId) {
      return await db.select().from(advancePayments).where(eq(advancePayments.workerId, workerId));
    }
    return await db.select().from(advancePayments);
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
    
    await db.insert(advancePayments).values(advance);

    // Update worker balance
    const worker = await this.getWorker(insertAdvance.workerId);
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
    
    const weeklyAttendance = await db.select()
      .from(attendance)
      .where(
        and(
          gte(attendance.date, weekStart.toISOString().split('T')[0]),
          lte(attendance.date, weekEnd.toISOString().split('T')[0]),
          eq(attendance.isPresent, true)
        )
      );
    
    const weeklyProduction = weeklyAttendance.reduce((sum, a) => sum + (a.bricksProduced || 0), 0);
    
    const recentOrders = await db.select()
      .from(salesOrders)
      .orderBy(desc(salesOrders.createdAt))
      .limit(5);

    return {
      totalWorkers: workers.length,
      todayAttendance: {
        present: todayAttendance.filter(a => a.isPresent).length,
        total: workers.length
      },
      weeklyProduction,
      inventoryLevel: (await this.getInventory()).currentStock,
      pendingPayments: 0, // Calculate based on unpaid amounts
      recentOrders
    };
  }
}
