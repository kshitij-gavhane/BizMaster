import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWorkerSchema, 
  insertAttendanceSchema, 
  insertCustomerSchema, 
  insertSalesOrderSchema,
  insertInventoryMovementSchema,
  insertPaymentSchema,
  insertAdvancePaymentSchema,
  insertTripSchema,
  insertTripParticipantSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Workers
  app.get("/api/workers", async (req, res) => {
    const workers = await storage.getWorkers();
    res.json(workers);
  });

  app.get("/api/workers/:id", async (req, res) => {
    const worker = await storage.getWorker(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    res.json(worker);
  });

  app.post("/api/workers", async (req, res) => {
    try {
      const workerData = insertWorkerSchema.parse(req.body);
      const worker = await storage.createWorker(workerData);
      res.json(worker);
    } catch (error) {
      res.status(400).json({ message: "Invalid worker data", error });
    }
  });

  app.put("/api/workers/:id", async (req, res) => {
    try {
      const worker = await storage.updateWorker(req.params.id, req.body);
      res.json(worker);
    } catch (error) {
      res.status(400).json({ message: "Failed to update worker", error });
    }
  });

  app.delete("/api/workers/:id", async (req, res) => {
    try {
      await storage.deleteWorker(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete worker", error });
    }
  });

  // Attendance
  app.get("/api/attendance", async (req, res) => {
    const date = req.query.date as string;
    const attendance = await storage.getAttendance(date);
    res.json(attendance);
  });

  app.get("/api/attendance/worker/:workerId", async (req, res) => {
    const { workerId } = req.params;
    const { weekStart, weekEnd } = req.query;
    const attendance = await storage.getWorkerAttendance(
      workerId, 
      weekStart as string, 
      weekEnd as string
    );
    res.json(attendance);
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.upsertAttendance(attendanceData);
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data", error });
    }
  });

  app.put("/api/attendance/:id", async (req, res) => {
    try {
      const attendance = await storage.updateAttendance(req.params.id, req.body);
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ message: "Failed to update attendance", error });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req, res) => {
    const customer = await storage.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data", error });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.updateCustomer(req.params.id, req.body);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to update customer", error });
    }
  });

  // Sales Orders
  app.get("/api/sales-orders", async (req, res) => {
    const orders = await storage.getSalesOrders();
    res.json(orders);
  });

  app.get("/api/sales-orders/:id", async (req, res) => {
    const order = await storage.getSalesOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Sales order not found" });
    }
    res.json(order);
  });

  app.post("/api/sales-orders", async (req, res) => {
    try {
      const orderData = insertSalesOrderSchema.parse(req.body);
      const order = await storage.createSalesOrder(orderData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid sales order data", error });
    }
  });

  app.put("/api/sales-orders/:id", async (req, res) => {
    try {
      const order = await storage.updateSalesOrder(req.params.id, req.body);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update sales order", error });
    }
  });

  // Inventory
  app.get("/api/inventory", async (req, res) => {
    const inventory = await storage.getInventory();
    res.json(inventory);
  });

  app.put("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.updateInventory(req.body);
      res.json(inventory);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inventory", error });
    }
  });

  app.get("/api/inventory/movements", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const movements = await storage.getInventoryMovements(limit);
    res.json(movements);
  });

  app.post("/api/inventory/movements", async (req, res) => {
    try {
      const movementData = insertInventoryMovementSchema.parse(req.body);
      const movement = await storage.createInventoryMovement(movementData);
      
      // Update inventory based on movement
      const inventory = await storage.getInventory();
      const newStock = inventory.currentStock + movementData.quantity;
      await storage.updateInventory({ currentStock: newStock });
      
      res.json(movement);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory movement data", error });
    }
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    const workerId = req.query.workerId as string;
    const payments = await storage.getPayments(workerId);
    res.json(payments);
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const applyAdvanceAmount = typeof req.body.applyAdvanceAmount === 'number' ? req.body.applyAdvanceAmount : undefined;
      const payment = await storage.createPayment(paymentData, applyAdvanceAmount);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data", error });
    }
  });

  // Weekly Summary
  app.get("/api/weekly-summary/:workerId/:weekStart", async (req, res) => {
    const { workerId, weekStart } = req.params;
    const summary = await storage.getWeeklySummary(workerId, weekStart);
    res.json(summary);
  });

  app.post("/api/weekly-summary", async (req, res) => {
    try {
      const summary = await storage.createWeeklySummary(req.body);
      res.json(summary);
    } catch (error) {
      res.status(400).json({ message: "Invalid weekly summary data", error });
    }
  });

  // Dashboard
  app.get("/api/dashboard/metrics", async (req, res) => {
    const metrics = await storage.getDashboardMetrics();
    res.json(metrics);
  });

  // Calculate weekly payments
  app.post("/api/payments/calculate-weekly", async (req, res) => {
    try {
      const { weekStart, weekEnd } = req.body;
      const workers = await storage.getWorkers();
      const calculations = [];

      for (const worker of workers) {
        const attendance = await storage.getWorkerAttendance(worker.id, weekStart, weekEnd);
        let grossAmount = 0;
        let daysWorked = 0;
        let bricksProduced = 0;

        if (worker.type === 'rojdaar') {
          daysWorked = attendance.filter(a => a.isPresent).length;
          grossAmount = daysWorked * Number(worker.dailyWage || 0);
        } else if (worker.type === 'karagir') {
          bricksProduced = attendance.reduce((sum, a) => sum + (a.bricksProduced || 0), 0);
          grossAmount = bricksProduced * Number(worker.pieceRate || 0);
        }

        calculations.push({
          workerId: worker.id,
          workerName: worker.name,
          workerType: worker.type,
          daysWorked,
          bricksProduced,
          grossAmount: grossAmount.toFixed(2),
          currentBalance: worker.balance
        });
      }

      res.json(calculations);
    } catch (error) {
      res.status(400).json({ message: "Failed to calculate weekly payments", error });
    }
  });

  // Advance Payments
  app.get("/api/advance-payments", async (req, res) => {
    const workerId = req.query.workerId as string;
    const advances = await storage.getAdvancePayments(workerId);
    res.json(advances);
  });

  app.post("/api/advance-payments", async (req, res) => {
    try {
      const advanceData = insertAdvancePaymentSchema.parse(req.body);
      const advance = await storage.createAdvancePayment(advanceData);
      res.json(advance);
    } catch (error) {
      res.status(400).json({ message: "Invalid advance payment data", error });
    }
  });

  // Trips for drivers
  app.get("/api/trips", async (req, res) => {
    const { driverId, weekStart, weekEnd } = req.query;
    const trips = await storage.getTrips(driverId as string | undefined, weekStart as string | undefined, weekEnd as string | undefined);
    res.json(trips);
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      // Participants provided separately as participantIds array
      const participantIds: string[] = Array.isArray(req.body.participantIds) ? req.body.participantIds : [];
      const result = await storage.createTripWithParticipants({ ...tripData, participantIds });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid trip data", error });
    }
  });

  // Notes
  app.get("/api/notes", async (_req, res) => {
    try {
      const list = await storage.getNotes(50);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch notes", error: error?.message || String(error) });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      if (typeof req.body.content !== 'string' || req.body.content.trim() === '') {
        return res.status(400).json({ message: "Invalid note content" });
      }
      const note = await storage.createNote({ content: req.body.content });
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Failed to create note", error });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete note", error });
    }
  });

  // Admin route: clear advances and reset balances (use carefully)
  app.post("/api/admin/clear-advances", async (_req, res) => {
    try {
      // Hard reset: delete all advances and zero balances
      await storage.clearAdvancesAndResetBalances();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear advances", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
