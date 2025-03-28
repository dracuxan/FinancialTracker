import { IncomeStatement } from "@shared/schema";
import { formatCurrency } from "@/lib/accounting";

interface IncomeTableProps {
  incomeStatement: IncomeStatement;
}

export default function IncomeTable({ incomeStatement }: IncomeTableProps) {
  const { revenues, expenses, totalRevenue, totalExpenses, netIncome } = incomeStatement;
  
  return (
    <table className="w-full mb-8">
      <tbody>
        {/* Revenue Section */}
        <tr>
          <td colSpan={3} className="py-2 font-bold text-lg">Revenue</td>
        </tr>
        
        {revenues.map(revenue => (
          <tr key={revenue.accountId}>
            <td className="py-1 pl-8">{revenue.accountName}</td>
            <td className="py-1 text-right">{formatCurrency(revenue.amount)}</td>
            <td></td>
          </tr>
        ))}
        
        <tr>
          <td className="py-2 font-medium">Total Revenue</td>
          <td></td>
          <td className="py-2 text-right font-medium">{formatCurrency(totalRevenue)}</td>
        </tr>
        
        {/* Expenses Section */}
        <tr>
          <td colSpan={3} className="py-2 font-bold text-lg">Expenses</td>
        </tr>
        
        {expenses.map(expense => (
          <tr key={expense.accountId}>
            <td className="py-1 pl-8">{expense.accountName}</td>
            <td className="py-1 text-right">{formatCurrency(expense.amount)}</td>
            <td></td>
          </tr>
        ))}
        
        <tr>
          <td className="py-2 font-medium">Total Expenses</td>
          <td></td>
          <td className="py-2 text-right font-medium">{formatCurrency(totalExpenses)}</td>
        </tr>
        
        {/* Net Income */}
        <tr>
          <td colSpan={3} className="border-t border-gray-300"></td>
        </tr>
        <tr>
          <td className="py-3 font-bold text-lg">Net Income</td>
          <td></td>
          <td className="py-3 text-right font-bold text-lg">{formatCurrency(netIncome)}</td>
        </tr>
      </tbody>
    </table>
  );
}
