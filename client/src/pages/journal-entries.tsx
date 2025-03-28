import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { JournalEntryWithTransactions, Account } from "@shared/schema";
import JournalForm from "@/components/journal/journal-form";
import JournalTable from "@/components/journal/journal-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function JournalEntries() {
  const { toast } = useToast();
  
  // Fetch journal entries and accounts
  const { 
    data: journalEntries = [],
    isLoading: entriesLoading
  } = useQuery<JournalEntryWithTransactions[]>({
    queryKey: ['/api/journal-entries']
  });
  
  const { 
    data: accounts = [],
    isLoading: accountsLoading
  } = useQuery<Account[]>({
    queryKey: ['/api/accounts']
  });
  
  // Mutation for creating journal entries
  const createJournalMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/journal-entries', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      toast({
        title: "Journal Entry Created",
        description: "Your journal entry has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create journal entry.",
        variant: "destructive"
      });
    }
  });
  
  const isLoading = entriesLoading || accountsLoading;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Journal Entry Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Add Journal Entry</h2>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <JournalForm 
              accounts={accounts} 
              onSubmit={(data) => createJournalMutation.mutate(data)}
              isPending={createJournalMutation.isPending}
            />
          )}
        </div>
      </div>
      
      {/* Journal Entries List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Journal Entries</h2>
              <div className="flex space-x-2">
                <button className="text-gray-500 hover:text-primary-600" onClick={() => {}}>
                  <span className="material-icons">download</span>
                </button>
                <button className="text-gray-500 hover:text-primary-600" onClick={() => {}}>
                  <span className="material-icons">print</span>
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <JournalTable 
              journalEntries={journalEntries} 
              accounts={accounts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
