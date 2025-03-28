/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencySymbol - The currency symbol to use
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencySymbol = "$"): string {
  return `${currencySymbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Calculate account balances based on debits and credits
 * @param debits - Total debits
 * @param credits - Total credits
 * @param accountType - Type of account (asset, liability, equity, revenue, expense)
 * @returns Account balance
 */
export function calculateAccountBalance(
  debits: number,
  credits: number,
  accountType: string
): number {
  // Normal balance:
  // Assets and Expenses: Debit
  // Liabilities, Equity, and Revenue: Credit
  if (['asset', 'expense'].includes(accountType.toLowerCase())) {
    return debits - credits;
  } else {
    return credits - debits;
  }
}

/**
 * Determine if an account's normal balance is debit or credit
 * @param accountType - Type of account
 * @returns True if account's normal balance is debit, false if credit
 */
export function isDebitBalanceAccount(accountType: string): boolean {
  return ['asset', 'expense'].includes(accountType.toLowerCase());
}

/**
 * Get the account types for classification
 * @returns Array of account types
 */
export function getAccountTypes(): string[] {
  return ['asset', 'liability', 'equity', 'revenue', 'expense'];
}

/**
 * Check if debits equal credits in a journal entry
 * @param debits - Total debits
 * @param credits - Total credits
 * @returns True if balanced, false otherwise
 */
export function isJournalEntryBalanced(debits: number, credits: number): boolean {
  // Use a small epsilon for floating point comparison
  return Math.abs(debits - credits) < 0.001;
}
