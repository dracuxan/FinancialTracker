import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  createJournalEntrySchema, 
  insertAccountSchema,
  insertJournalEntrySchema,
  insertTransactionLineSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all accounts
  app.get("/api/accounts", async (_req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Get a specific account
  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  // Create a new account
  app.post("/api/accounts", async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Get all journal entries
  app.get("/api/journal-entries", async (_req, res) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  // Get a specific journal entry
  app.get("/api/journal-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(id);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  // Create a journal entry with transaction lines
  app.post("/api/journal-entries", async (req, res) => {
    try {
      const journalData = createJournalEntrySchema.parse(req.body);
      
      // Validate that debits equal credits
      const debits = journalData.transactions
        .filter(t => t.isDebit)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const credits = journalData.transactions
        .filter(t => !t.isDebit)
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (Math.abs(debits - credits) > 0.001) { // Using a small epsilon for floating point comparison
        return res.status(400).json({ message: "Debits must equal credits" });
      }
      
      // Create journal entry
      const journalEntry = await storage.createJournalEntry(
        {
          date: journalData.date,
          description: journalData.description
        },
        journalData.transactions.map(t => ({
          accountId: t.accountId,
          amount: t.amount,
          isDebit: t.isDebit,
          journalEntryId: 0 // This will be set by the createJournalEntry method
        }))
      );
      
      res.status(201).json(journalEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid journal entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  // Get all ledger accounts
  app.get("/api/ledger", async (_req, res) => {
    try {
      const ledgerAccounts = await storage.getLedgerAccounts();
      res.json(ledgerAccounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ledger accounts" });
    }
  });

  // Get a specific ledger account
  app.get("/api/ledger/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ledgerAccount = await storage.getLedgerAccount(id);
      
      if (!ledgerAccount) {
        return res.status(404).json({ message: "Ledger account not found" });
      }
      
      res.json(ledgerAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ledger account" });
    }
  });

  // Get income statement
  app.get("/api/income-statement", async (req, res) => {
    try {
      // Parse start and end date from query parameters with defaults
      const startDateStr = req.query.startDate as string || new Date(0).toISOString();
      const endDateStr = req.query.endDate as string || new Date().toISOString();
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const incomeStatement = await storage.getIncomeStatement(startDate, endDate);
      res.json(incomeStatement);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate income statement" });
    }
  });

  // Update inventory data for income statement
  app.post("/api/income-statement/inventory", async (req, res) => {
    try {
      // Validate inventory data
      const inventorySchema = z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        openingStock: z.coerce.number().min(0, "Opening stock must be a non-negative number"),
        purchases: z.coerce.number().min(0, "Purchases must be a non-negative number"),
        closingStock: z.coerce.number().min(0, "Closing stock must be a non-negative number"),
        purchaseReturns: z.coerce.number().min(0, "Purchase returns must be a non-negative number")
      });
      
      const inventoryData = inventorySchema.parse(req.body);
      
      // Calculate income statement with inventory data
      const incomeStatement = await storage.getIncomeStatement(
        inventoryData.startDate,
        inventoryData.endDate,
        {
          openingStock: inventoryData.openingStock,
          purchases: inventoryData.purchases,
          closingStock: inventoryData.closingStock,
          purchaseReturns: inventoryData.purchaseReturns
        }
      );
      
      res.json(incomeStatement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate income statement with inventory data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
