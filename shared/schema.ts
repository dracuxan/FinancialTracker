import { pgTable, text, serial, integer, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Accounts table to store ledger accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // asset, liability, equity, revenue, expense
  description: text("description"),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
});

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description").notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
});

// Transaction lines for journal entries
export const transactionLines = pgTable("transaction_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").notNull(),
  accountId: integer("account_id").notNull(),
  amount: numeric("amount").notNull(),
  isDebit: integer("is_debit").notNull(), // 1 for debit, 0 for credit
});

export const insertTransactionLineSchema = createInsertSchema(transactionLines).omit({
  id: true,
});

// Schema for creating a journal entry with multiple transaction lines
export const createJournalEntrySchema = z.object({
  date: z.coerce.date(),
  description: z.string().min(1, "Description is required"),
  transactions: z.array(
    z.object({
      accountId: z.number().int().positive("Account is required"),
      amount: z.coerce.number().positive("Amount must be greater than 0"),
      isDebit: z.boolean(),
    })
  ).min(2, "At least two transactions are required"),
});

// Types based on the schemas
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type TransactionLine = typeof transactionLines.$inferSelect;
export type InsertTransactionLine = z.infer<typeof insertTransactionLineSchema>;

export type CreateJournalEntry = z.infer<typeof createJournalEntrySchema>;

// Types for the frontend
export type JournalEntryWithTransactions = JournalEntry & {
  transactions: (TransactionLine & { account: Account })[];
};

export type LedgerAccount = Account & {
  transactions: (TransactionLine & { journalEntry: JournalEntry })[];
  balance: number;
  debitTotal: number;
  creditTotal: number;
};

export type IncomeStatementItem = {
  accountId: number;
  accountName: string;
  amount: number;
};

export type InventoryItem = {
  openingStock: number;
  purchases: number;
  closingStock: number;
  purchaseReturns: number;
  cogs: number; // Calculated field
};

export type IncomeStatement = {
  revenues: IncomeStatementItem[];
  expenses: IncomeStatementItem[];
  totalRevenue: number;
  totalExpenses: number;
  inventory: InventoryItem;
  grossProfit: number; // Revenue - COGS
  netIncome: number;
  startDate: Date;
  endDate: Date;
};

// For user authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
