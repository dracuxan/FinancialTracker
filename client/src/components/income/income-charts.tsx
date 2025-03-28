import { IncomeStatement } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface IncomeChartsProps {
  incomeStatement: IncomeStatement;
}

export default function IncomeCharts({ incomeStatement }: IncomeChartsProps) {
  const { revenues, expenses, totalRevenue, totalExpenses } = incomeStatement;
  
  // Prepare data for revenue vs expenses chart
  const compareData = [
    {
      name: 'Revenue',
      value: totalRevenue,
    },
    {
      name: 'Expenses',
      value: totalExpenses,
    }
  ];
  
  // Prepare data for expense breakdown pie chart
  const expenseData = expenses.map(expense => ({
    name: expense.accountName,
    value: expense.amount
  }));
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];
  
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-center">Revenue vs Expenses</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={compareData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
              />
              <Legend />
              <Bar dataKey="value" fill="#0F62FE" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-center">Expense Breakdown</h4>
        <div className="h-64">
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-center">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p>No expense data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
