import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define schema for inventory data
const inventoryFormSchema = z.object({
  openingStock: z.coerce.number().min(0, "Opening stock must be a non-negative number"),
  purchases: z.coerce.number().min(0, "Purchases must be a non-negative number"),
  closingStock: z.coerce.number().min(0, "Closing stock must be a non-negative number"),
  purchaseReturns: z.coerce.number().min(0, "Purchase returns must be a non-negative number"),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  startDate: string;
  endDate: string;
  onSuccess: () => void;
}

export default function InventoryForm({ startDate, endDate, onSuccess }: InventoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      openingStock: 0,
      purchases: 0,
      closingStock: 0,
      purchaseReturns: 0,
    },
  });

  // Handle form submission
  async function onSubmit(values: InventoryFormValues) {
    setIsSubmitting(true);
    try {
      // Send inventory data to the server
      await apiRequest('/api/income-statement/inventory', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          startDate,
          endDate
        }),
      });
      
      // Show success message
      toast({
        title: "Inventory updated",
        description: "COGS has been calculated based on your inventory data.",
      });
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Formula explanation
  const formulaExplanation = "COGS = Opening Stock + Purchases - Closing Stock - Purchase Returns";

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Inventory & Cost of Goods Sold</CardTitle>
        <CardDescription>
          Enter your inventory details to calculate Cost of Goods Sold (COGS).
          <br/>
          <span className="text-sm font-medium mt-2 inline-block">{formulaExplanation}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="openingStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Value of inventory at the beginning of the period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purchases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchases</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cost of new inventory bought during the period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="closingStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Value of unsold inventory at the end of the period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purchaseReturns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Returns</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Value of stock returned to suppliers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <CardFooter className="px-0 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Calculating..." : "Calculate COGS"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}