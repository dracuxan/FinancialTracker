import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Settings, HelpCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Navbar() {
  const [location] = useLocation();
  
  return (
    <>
      <header className="bg-primary-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Financial Accounting System</h1>
          <nav>
            <ul className="flex space-x-1">
              <li>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="px-3 py-2 rounded hover:bg-primary-600 transition">
                        <HelpCircle className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Help</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
              <li>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="px-3 py-2 rounded hover:bg-primary-600 transition">
                        <Settings className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            <Link href="/journal">
              <a className={`px-6 py-4 font-medium whitespace-nowrap ${
                location === "/" || location === "/journal" 
                  ? "text-primary-600 border-b-2 border-primary-500" 
                  : "text-gray-500 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-300"
              }`}>
                Journal Entries
              </a>
            </Link>
            <Link href="/ledger">
              <a className={`px-6 py-4 font-medium whitespace-nowrap ${
                location === "/ledger" 
                  ? "text-primary-600 border-b-2 border-primary-500" 
                  : "text-gray-500 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-300"
              }`}>
                Ledger Accounts
              </a>
            </Link>
            <Link href="/income">
              <a className={`px-6 py-4 font-medium whitespace-nowrap ${
                location === "/income" 
                  ? "text-primary-600 border-b-2 border-primary-500" 
                  : "text-gray-500 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-300"
              }`}>
                Income Statement
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
