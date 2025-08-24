import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workers = pgTable("workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'rojdaar' or 'karagir'
  dailyWage: decimal("daily_wage", { precision: 10, scale: 2 }), // for rojdaar workers
  pieceRate: decimal("piece_rate", { precision: 10, scale: 4 }), // for karagir workers (per brick)
  phone: text("phone"),
  address: text("address"),
  joinDate: date("join_date").notNull(),
  isActive: boolean("is_active").default(true),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"), // outstanding balance
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  date: date("date").notNull(),
  isPresent: boolean("is_present").notNull(),
  bricksProduced: integer("bricks_produced").default(0), // for karagir workers
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  ratePerBrick: decimal("rate_per_brick", { precision: 10, scale: 4 }).notNull(),
  totalOrders: integer("total_orders").default(0),
  lastOrderDate: date("last_order_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const salesOrders = pgTable("sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  quantity: integer("quantity").notNull(),
  ratePerBrick: decimal("rate_per_brick", { precision: 10, scale: 4 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  vehicleType: text("vehicle_type").notNull(), // 'truck' or 'tractor'
  vehicleNumber: text("vehicle_number").notNull(),
  driverName: text("driver_name").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'delivered', 'invoiced'
  orderDate: date("order_date").notNull(),
  deliveryDate: date("delivery_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currentStock: integer("current_stock").notNull(),
  khangerStock: integer("khanger_stock").default(0), // byproduct
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'production', 'sale', 'adjustment', 'damage'
  quantity: integer("quantity").notNull(), // positive for addition, negative for deduction
  reason: text("reason"),
  referenceId: varchar("reference_id"), // sales order id, etc.
  movementDate: timestamp("movement_date").default(sql`now()`),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  daysWorked: integer("days_worked"), // for rojdaar
  bricksProduced: integer("bricks_produced"), // for karagir
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull(),
  balanceAmount: decimal("balance_amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").default(sql`now()`),
  notes: text("notes"),
});

export const weeklySummary = pgTable("weekly_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  daysWorked: integer("days_worked").default(0),
  bricksProduced: integer("bricks_produced").default(0),
  grossEarnings: decimal("gross_earnings", { precision: 10, scale: 2 }).default("0"),
  isCalculated: boolean("is_calculated").default(false),
});

export const advancePayments = pgTable("advance_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason"),
  paymentDate: timestamp("payment_date").default(sql`now()`),
  notes: text("notes"),
});

// Insert schemas
export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  balance: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  totalOrders: true,
  lastOrderDate: true,
  createdAt: true,
});

export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({
  id: true,
  orderNumber: true,
  totalAmount: true,
  createdAt: true,
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  movementDate: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  paymentDate: true,
});

export const insertWeeklySummarySchema = createInsertSchema(weeklySummary).omit({
  id: true,
});

export const insertAdvancePaymentSchema = createInsertSchema(advancePayments).omit({
  id: true,
  paymentDate: true,
});

// Types
export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;

export type Inventory = typeof inventory.$inferSelect;

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type WeeklySummary = typeof weeklySummary.$inferSelect;
export type InsertWeeklySummary = z.infer<typeof insertWeeklySummarySchema>;

export type AdvancePayment = typeof advancePayments.$inferSelect;
export type InsertAdvancePayment = z.infer<typeof insertAdvancePaymentSchema>;
