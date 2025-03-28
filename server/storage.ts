import { 
  Account, 
  InsertAccount, 
  JournalEntry, 
  InsertJournalEntry, 
  TransactionLine, 
  InsertTransactionLine, 
  JournalEntryWithTransactions,
  LedgerAccount,
  IncomeStatement,
  users,
  User,
  InsertUser,
  accounts,
  journalEntries,
  transactionLines
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Account methods
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;

  // Journal entry methods
  getJournalEntries(): Promise<JournalEntryWithTransactions[]>;
  getJournalEntry(id: number): Promise<JournalEntryWithTransactions | undefined>;
  createJournalEntry(entry: InsertJournalEntry, transactions: InsertTransactionLine[]): Promise<JournalEntryWithTransactions>;

  // Ledger methods
  getLedgerAccounts(): Promise<LedgerAccount[]>;
  getLedgerAccount(id: number): Promise<LedgerAccount | undefined>;

  // Income statement methods
  getIncomeStatement(startDate: Date, endDate: Date): Promise<IncomeStatement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private journalEntries: Map<number, JournalEntry>;
  private transactionLines: Map<number, TransactionLine>;
  
  private userIdCounter: number;
  private accountIdCounter: number;
  private journalEntryIdCounter: number;
  private transactionLineIdCounter: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.journalEntries = new Map();
    this.transactionLines = new Map();
    
    this.userIdCounter = 1;
    this.accountIdCounter = 1;
    this.journalEntryIdCounter = 1;
    this.transactionLineIdCounter = 1;

    // Initialize with default accounts
    this.initializeDefaultAccounts();
  }

  private initializeDefaultAccounts() {
    const defaultAccounts: InsertAccount[] = [
      { name: "Cash", type: "asset", description: "Cash on hand and in bank accounts" },
      { name: "Accounts Receivable", type: "asset", description: "Money owed to the company" },
      { name: "Inventory", type: "asset", description: "Items held for sale" },
      { name: "Supplies", type: "asset", description: "Office and operational supplies" },
      { name: "Equipment", type: "asset", description: "Business equipment" },
      { name: "Accounts Payable", type: "liability", description: "Money owed by the company" },
      { name: "Notes Payable", type: "liability", description: "Formal debt obligations" },
      { name: "Revenue", type: "revenue", description: "Income from sales or services" },
      { name: "Rent Expense", type: "expense", description: "Cost of renting space" },
      { name: "Salary Expense", type: "expense", description: "Employee salaries" },
      { name: "Utilities Expense", type: "expense", description: "Costs for electricity, water, etc." }
    ];

    defaultAccounts.forEach(account => {
      this.createAccount(account);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Account methods
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const id = this.accountIdCounter++;
    const newAccount: Account = { ...account, id };
    this.accounts.set(id, newAccount);
    return newAccount;
  }

  // Journal entry methods
  async getJournalEntries(): Promise<JournalEntryWithTransactions[]> {
    const entries = Array.from(this.journalEntries.values());
    return Promise.all(entries.map(entry => this.getJournalEntryWithTransactions(entry.id)));
  }

  async getJournalEntry(id: number): Promise<JournalEntryWithTransactions | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    return this.getJournalEntryWithTransactions(id);
  }

  private async getJournalEntryWithTransactions(id: number): Promise<JournalEntryWithTransactions> {
    const entry = this.journalEntries.get(id)!;
    const transactions = Array.from(this.transactionLines.values())
      .filter(line => line.journalEntryId === id)
      .map(line => ({
        ...line,
        account: this.accounts.get(line.accountId)!
      }));
    
    return {
      ...entry,
      transactions
    };
  }

  async createJournalEntry(entry: InsertJournalEntry, transactions: InsertTransactionLine[]): Promise<JournalEntryWithTransactions> {
    // Create journal entry
    const entryId = this.journalEntryIdCounter++;
    const newEntry: JournalEntry = { ...entry, id: entryId };
    this.journalEntries.set(entryId, newEntry);

    // Create transaction lines
    const transactionsWithIds = transactions.map(transaction => {
      const id = this.transactionLineIdCounter++;
      const newTransaction: TransactionLine = { 
        ...transaction, 
        id,
        journalEntryId: entryId 
      };
      this.transactionLines.set(id, newTransaction);
      return {
        ...newTransaction,
        account: this.accounts.get(transaction.accountId)!
      };
    });

    return {
      ...newEntry,
      transactions: transactionsWithIds
    };
  }

  // Ledger methods
  async getLedgerAccounts(): Promise<LedgerAccount[]> {
    const accounts = await this.getAccounts();
    return Promise.all(accounts.map(account => this.getLedgerAccount(account.id)));
  }

  async getLedgerAccount(id: number): Promise<LedgerAccount | undefined> {
    const account = await this.getAccount(id);
    if (!account) return undefined;

    const accountTransactions = Array.from(this.transactionLines.values())
      .filter(line => line.accountId === id)
      .map(line => ({
        ...line,
        journalEntry: this.journalEntries.get(line.journalEntryId)!
      }));

    // Sort transactions by date
    accountTransactions.sort((a, b) => {
      return new Date(a.journalEntry.date).getTime() - new Date(b.journalEntry.date).getTime();
    });

    const debitTotal = accountTransactions
      .filter(t => t.isDebit)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const creditTotal = accountTransactions
      .filter(t => !t.isDebit)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Calculate balance based on account type
    let balance = 0;
    if (['asset', 'expense'].includes(account.type)) {
      balance = debitTotal - creditTotal;
    } else {
      balance = creditTotal - debitTotal;
    }

    return {
      ...account,
      transactions: accountTransactions,
      balance,
      debitTotal,
      creditTotal
    };
  }

  // Income statement methods
  async getIncomeStatement(startDate: Date, endDate: Date): Promise<IncomeStatement> {
    const accounts = await this.getAccounts();
    const revenueAccounts = accounts.filter(account => account.type === 'revenue');
    const expenseAccounts = accounts.filter(account => account.type === 'expense');

    // Get all transactions in date range
    const allTransactions = Array.from(this.transactionLines.values())
      .map(line => ({
        ...line,
        journalEntry: this.journalEntries.get(line.journalEntryId)!,
        account: this.accounts.get(line.accountId)!
      }))
      .filter(t => {
        const entryDate = new Date(t.journalEntry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

    // Calculate revenues
    const revenues = revenueAccounts.map(account => {
      const accountTransactions = allTransactions.filter(t => t.accountId === account.id);
      const creditAmount = accountTransactions
        .filter(t => !t.isDebit)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const debitAmount = accountTransactions
        .filter(t => t.isDebit)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const amount = creditAmount - debitAmount; // Revenues are normally credit accounts
      
      return {
        accountId: account.id,
        accountName: account.name,
        amount
      };
    }).filter(item => item.amount > 0);

    // Calculate expenses
    const expenses = expenseAccounts.map(account => {
      const accountTransactions = allTransactions.filter(t => t.accountId === account.id);
      const debitAmount = accountTransactions
        .filter(t => t.isDebit)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const creditAmount = accountTransactions
        .filter(t => !t.isDebit)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const amount = debitAmount - creditAmount; // Expenses are normally debit accounts
      
      return {
        accountId: account.id,
        accountName: account.name,
        amount
      };
    }).filter(item => item.amount > 0);

    // Calculate totals
    const totalRevenue = revenues.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      revenues,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome,
      startDate,
      endDate
    };
  }
}

export const storage = new MemStorage();
