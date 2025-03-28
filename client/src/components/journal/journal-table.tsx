import { JournalEntryWithTransactions, Account } from "@shared/schema";
import { formatCurrency } from "@/lib/accounting";

interface JournalTableProps {
  journalEntries: JournalEntryWithTransactions[];
  accounts: Account[];
}

export default function JournalTable({ journalEntries, accounts }: JournalTableProps) {
  // Sort entries by date (most recent first)
  const sortedEntries = [...journalEntries].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Format date to display in table
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-6 py-3 text-left font-medium">Date</th>
            <th className="px-6 py-3 text-left font-medium">Description</th>
            <th className="px-6 py-3 text-left font-medium">Account</th>
            <th className="px-6 py-3 text-right font-medium">Debit</th>
            <th className="px-6 py-3 text-right font-medium">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedEntries.length > 0 ? (
            sortedEntries.map(entry => {
              const transactions = entry.transactions;
              
              return (
                <>
                  {transactions.map((transaction, idx) => (
                    <tr key={`${entry.id}-${idx}`}>
                      {idx === 0 && (
                        <>
                          <td className="px-6 py-4" rowSpan={transactions.length}>
                            {formatDate(entry.date.toString())}
                          </td>
                          <td className="px-6 py-4" rowSpan={transactions.length}>
                            {entry.description}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4">{transaction.account.name}</td>
                      <td className="px-6 py-4 text-right">
                        {transaction.isDebit ? formatCurrency(Number(transaction.amount)) : ""}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!transaction.isDebit ? formatCurrency(Number(transaction.amount)) : ""}
                      </td>
                    </tr>
                  ))}
                </>
              );
            })
          ) : (
            <tr id="empty-journal">
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No journal entries yet. Add your first entry using the form.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
