import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LedgerAccount } from "@shared/schema";
import LedgerTable from "@/components/ledger/ledger-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Printer, Search } from "lucide-react";

export default function LedgerAccounts() {
  const [selectedAccountType, setSelectedAccountType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Fetch ledger accounts
  const { 
    data: ledgerAccounts = [],
    isLoading
  } = useQuery<LedgerAccount[]>({
    queryKey: ['/api/ledger']
  });
  
  // Filter accounts based on selected type and search term
  const filteredAccounts = ledgerAccounts.filter(account => {
    // Filter by account type
    if (selectedAccountType !== "all" && account.type !== selectedAccountType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !account.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Group accounts by type for button display
  const accountTypes = Array.from(new Set(ledgerAccounts.map(account => account.type)));
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Ledger Accounts</h2>
          <div className="flex items-center">
            <div className="relative mr-4">
              <Input
                type="text"
                placeholder="Search accounts..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
      
      {/* Account Selector */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedAccountType === "all" ? "default" : "outline"}
            onClick={() => setSelectedAccountType("all")}
          >
            All Accounts
          </Button>
          
          {accountTypes.map(type => (
            <Button
              key={type}
              variant={selectedAccountType === type ? "default" : "outline"}
              onClick={() => setSelectedAccountType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-6">
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <LedgerTable ledgerAccounts={filteredAccounts} />
      )}
    </div>
  );
}
