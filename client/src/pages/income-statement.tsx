import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IncomeStatement } from "@shared/schema";
import IncomeTable from "@/components/income/income-table";
import IncomeCharts from "@/components/income/income-charts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function IncomeStatementPage() {
  const [period, setPeriod] = useState<string>("month");
  const [showCustomDates, setShowCustomDates] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate("month"));
  const [endDate, setEndDate] = useState<string>(formatDate(new Date()));
  
  // Calculate default start date based on period
  function getDefaultStartDate(periodType: string): string {
    const today = new Date();
    let result = new Date();
    
    switch(periodType) {
      case "month":
        result = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "quarter":
        const quarter = Math.floor(today.getMonth() / 3);
        result = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        result = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        result = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    return formatDate(result);
  }
  
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  // Handle period change
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value === "custom") {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
      setStartDate(getDefaultStartDate(value));
      setEndDate(formatDate(new Date()));
    }
  };
  
  // Fetch income statement data
  const { 
    data: incomeStatement,
    isLoading
  } = useQuery<IncomeStatement>({
    queryKey: ['/api/income-statement', startDate, endDate],
    queryFn: async ({ queryKey }) => {
      const [_, start, end] = queryKey;
      const response = await fetch(`/api/income-statement?startDate=${start}&endDate=${end}`);
      if (!response.ok) {
        throw new Error('Failed to fetch income statement');
      }
      return response.json();
    }
  });
  
  // Apply custom date range
  const applyCustomDateRange = () => {
    if (startDate && endDate) {
      // The query will automatically refetch when startDate or endDate changes
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Income Statement</h2>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="period-select" className="font-medium text-sm">Period:</Label>
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Current Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
                  <SelectItem value="year">Year to Date</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <button className="text-gray-500 hover:text-primary-600">
                <Download className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-primary-600">
                <Printer className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Date Range Selector */}
      {showCustomDates && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">From</Label>
              <Input 
                type="date" 
                id="date-from"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">To</Label>
              <Input 
                type="date" 
                id="date-to"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="self-end">
              <Button onClick={applyCustomDateRange}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Income Statement Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full max-w-sm mx-auto" />
            <Skeleton className="h-6 w-full max-w-xs mx-auto" />
            <Skeleton className="h-6 w-full max-w-md mx-auto mb-8" />
            <Skeleton className="h-64 w-full" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          </div>
        ) : incomeStatement ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold">COMPANY NAME</h3>
              <p className="text-lg font-medium">Income Statement</p>
              <p className="text-gray-600">
                For the Period {new Date(incomeStatement.startDate).toLocaleDateString()} to {new Date(incomeStatement.endDate).toLocaleDateString()}
              </p>
            </div>
            
            <IncomeTable incomeStatement={incomeStatement} />
            
            <IncomeCharts incomeStatement={incomeStatement} />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No data available for the selected period.
          </div>
        )}
      </div>
    </div>
  );
}
