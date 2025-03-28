import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Account } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, PlusCircle, MinusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/accounting";

// Define form schema with validation
const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  transactions: z.array(
    z.object({
      accountId: z.string().min(1, "Account is required"),
      amount: z.string().min(1, "Amount is required")
        .refine(val => !isNaN(parseFloat(val)), "Must be a valid number")
        .refine(val => parseFloat(val) > 0, "Amount must be greater than 0"),
      isDebit: z.boolean()
    })
  ).min(2, "At least two transactions are required")
});

type FormValues = z.infer<typeof formSchema>;

interface JournalFormProps {
  accounts: Account[];
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export default function JournalForm({ accounts, onSubmit, isPending }: JournalFormProps) {
  const [showValidationError, setShowValidationError] = useState(false);
  
  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: currentDate,
      description: "",
      transactions: [
        { accountId: "", amount: "", isDebit: true },
        { accountId: "", amount: "", isDebit: false }
      ]
    }
  });
  
  // Watch transactions to calculate totals
  const transactions = form.watch("transactions");
  
  // Calculate debit and credit totals
  const debitTotal = transactions
    .filter(t => t.isDebit)
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  
  const creditTotal = transactions
    .filter(t => !t.isDebit)
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  
  // Check if debits equal credits
  const isBalanced = Math.abs(debitTotal - creditTotal) < 0.001;
  
  // Add a new transaction line
  const addTransactionLine = () => {
    const currentTransactions = form.getValues("transactions");
    form.setValue("transactions", [
      ...currentTransactions,
      { accountId: "", amount: "", isDebit: currentTransactions.length % 2 === 0 }
    ]);
  };
  
  // Remove a transaction line
  const removeTransactionLine = (index: number) => {
    const currentTransactions = form.getValues("transactions");
    if (currentTransactions.length <= 2) return; // Keep at least 2 transactions
    
    form.setValue("transactions", 
      currentTransactions.filter((_, i) => i !== index)
    );
  };
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Check if debits equal credits
    if (!isBalanced) {
      setShowValidationError(true);
      return;
    }
    
    // Format data for API
    const formattedData = {
      date: new Date(values.date),
      description: values.description,
      transactions: values.transactions.map(t => ({
        accountId: parseInt(t.accountId),
        amount: parseFloat(t.amount),
        isDebit: t.isDebit
      }))
    };
    
    onSubmit(formattedData);
    
    // Reset form after successful submission
    if (!isPending) {
      form.reset({
        date: currentDate,
        description: "",
        transactions: [
          { accountId: "", amount: "", isDebit: true },
          { accountId: "", amount: "", isDebit: false }
        ]
      });
      setShowValidationError(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="mb-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter transaction description" 
                    rows={2}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <h3 className="font-medium text-lg mb-3">Transaction Details</h3>
        
        {/* Transaction line headers */}
        <div className="mb-2 grid grid-cols-12 gap-2">
          <div className="col-span-5 text-sm font-medium text-gray-700">Account</div>
          <div className="col-span-3 text-sm font-medium text-gray-700">Amount</div>
          <div className="col-span-3 text-sm font-medium text-gray-700">Type</div>
          <div className="col-span-1"></div>
        </div>
        
        {/* Transaction lines */}
        {transactions.map((_, index) => (
          <div key={index} className="mb-3 grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <FormField
                control={form.control}
                name={`transactions.${index}.accountId`}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="col-span-3">
              <FormField
                control={form.control}
                name={`transactions.${index}.amount`}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0"
                    className="text-sm"
                    {...field}
                  />
                )}
              />
            </div>
            
            <div className="col-span-3">
              <FormField
                control={form.control}
                name={`transactions.${index}.isDebit`}
                render={({ field }) => (
                  <Select
                    value={field.value ? "debit" : "credit"}
                    onValueChange={(value) => field.onChange(value === "debit")}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="col-span-1 flex items-center justify-center">
              <button 
                type="button" 
                className="text-gray-500 hover:text-red-500"
                onClick={() => removeTransactionLine(index)}
              >
                <MinusCircle size={18} />
              </button>
            </div>
          </div>
        ))}
        
        <div className="mb-6">
          <button 
            type="button" 
            className="text-primary-600 text-sm font-medium flex items-center"
            onClick={addTransactionLine}
          >
            <PlusCircle size={18} className="mr-1" /> Add line
          </button>
        </div>
        
        {/* Validation Summary */}
        {showValidationError && !isBalanced && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error: Debits and credits must be equal.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Debit Total: <span className="text-gray-900">{formatCurrency(debitTotal)}</span></p>
            <p className="text-sm font-medium">Credit Total: <span className="text-gray-900">{formatCurrency(creditTotal)}</span></p>
          </div>
          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording..." : "Record Entry"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
