import { IncomeStatement } from "@shared/schema";
import { formatCurrency } from "@/lib/accounting";

interface IncomeTableProps {
  incomeStatement: IncomeStatement;
}

export default function IncomeTable({ incomeStatement }: IncomeTableProps) {
  const { 
    revenues, 
    expenses, 
    totalRevenue, 
    totalExpenses, 
    netIncome,
    inventory,
    grossProfit
  } = incomeStatement;
  
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
        
        {/* Cost of Goods Sold Section */}
        <tr>
          <td colSpan={3} className="py-2 font-bold text-lg">Cost of Goods Sold</td>
        </tr>
        
        <tr>
          <td className="py-1 pl-8">Opening Stock</td>
          <td className="py-1 text-right">{formatCurrency(inventory.openingStock)}</td>
          <td></td>
        </tr>
        
        <tr>
          <td className="py-1 pl-8">Add: Purchases</td>
          <td className="py-1 text-right">{formatCurrency(inventory.purchases)}</td>
          <td></td>
        </tr>
        
        <tr>
          <td className="py-1 pl-8">Less: Closing Stock</td>
          <td className="py-1 text-right">({formatCurrency(inventory.closingStock)})</td>
          <td></td>
        </tr>
        
        <tr>
          <td className="py-1 pl-8">Less: Purchase Returns</td>
          <td className="py-1 text-right">({formatCurrency(inventory.purchaseReturns)})</td>
          <td></td>
        </tr>
        
        <tr>
          <td className="py-2 font-medium">Cost of Goods Sold</td>
          <td></td>
          <td className="py-2 text-right font-medium">{formatCurrency(inventory.cogs)}</td>
        </tr>
        
        {/* Gross Profit */}
        <tr>
          <td className="py-2 font-medium">Gross Profit</td>
          <td></td>
          <td className="py-2 text-right font-medium">{formatCurrency(grossProfit)}</td>
        </tr>
        
        {/* Other Expenses Section */}
        <tr>
          <td colSpan={3} className="py-2 font-bold text-lg">Operating Expenses</td>
        </tr>
        
        {expenses.map(expense => (
          <tr key={expense.accountId}>
            <td className="py-1 pl-8">{expense.accountName}</td>
            <td className="py-1 text-right">{formatCurrency(expense.amount)}</td>
            <td></td>
          </tr>
        ))}
        
        <tr>
          <td className="py-2 font-medium">Total Operating Expenses</td>
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
