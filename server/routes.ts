import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWorkerSchema, 
  insertAttendanceSchema, 
  insertCustomerSchema, 
  insertSalesOrderSchema,
  insertInventoryMovementSchema,
  insertPaymentSchema
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
      const attendance = await storage.createAttendance(attendanceData);
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
      const payment = await storage.createPayment(paymentData);
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

  const httpServer = createServer(app);
  return httpServer;
}
