import { LedgerAccount } from "@shared/schema";
import { formatCurrency } from "@/lib/accounting";

interface LedgerTableProps {
  ledgerAccounts: LedgerAccount[];
}

export default function LedgerTable({ ledgerAccounts }: LedgerTableProps) {
  // Format date to display in table
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get balance nature (Dr/Cr) based on account type
  const getBalanceNature = (account: LedgerAccount) => {
    const isDebitNature = ['asset', 'expense'].includes(account.type);
    
    if (account.balance === 0) return "";
    
    return isDebitNature ? 
      (account.balance >= 0 ? "Dr" : "Cr") : 
      (account.balance >= 0 ? "Cr" : "Dr");
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-6 py-3 text-left font-medium">Date</th>
            <th className="px-6 py-3 text-left font-medium">Description</th>
            <th className="px-6 py-3 text-right font-medium">Debit</th>
            <th className="px-6 py-3 text-right font-medium">Credit</th>
            <th className="px-6 py-3 text-right font-medium">Balance</th>
          </tr>
        </thead>
        
        {ledgerAccounts.length > 0 ? (
          ledgerAccounts.map(account => {
            let runningBalance = 0;
            const isDebitNature = ['asset', 'expense'].includes(account.type);
            
            return (
              <tbody key={account.id} className="divide-y divide-gray-200">
                <tr className="bg-gray-100">
                  <td colSpan={5} className="px-6 py-3 font-medium">
                    {account.name}
                  </td>
                </tr>
                
                {account.transactions.map((transaction, idx) => {
                  // Calculate running balance
                  if (isDebitNature) {
                    runningBalance += transaction.isDebit 
                      ? Number(transaction.amount)
                      : -Number(transaction.amount);
                  } else {
                    runningBalance += transaction.isDebit 
                      ? -Number(transaction.amount)
                      : Number(transaction.amount);
                  }
                  
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4">{formatDate(transaction.journalEntry.date.toString())}</td>
                      <td className="px-6 py-4">{transaction.journalEntry.description}</td>
                      <td className="px-6 py-4 text-right">
                        {transaction.isDebit ? formatCurrency(Number(transaction.amount)) : ""}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!transaction.isDebit ? formatCurrency(Number(transaction.amount)) : ""}
                      </td>
                      <td className="px-6 py-4 text-right">{formatCurrency(Math.abs(runningBalance))}</td>
                    </tr>
                  );
                })}
                
                <tr className="bg-gray-100 font-medium">
                  <td className="px-6 py-3" colSpan={2}>Balance</td>
                  <td className="px-6 py-3 text-right">{formatCurrency(account.debitTotal)}</td>
                  <td className="px-6 py-3 text-right">{formatCurrency(account.creditTotal)}</td>
                  <td className="px-6 py-3 text-right">
                    {formatCurrency(Math.abs(account.balance))} {getBalanceNature(account)}
                  </td>
                </tr>
              </tbody>
            );
          })
        ) : (
          <tbody id="empty-ledger">
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No ledger accounts available. Add journal entries first.
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
