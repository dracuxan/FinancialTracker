import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/layout";
import JournalEntries from "@/pages/journal-entries";
import LedgerAccounts from "@/pages/ledger-accounts";
import IncomeStatement from "@/pages/income-statement";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={JournalEntries} />
        <Route path="/journal" component={JournalEntries} />
        <Route path="/ledger" component={LedgerAccounts} />
        <Route path="/income" component={IncomeStatement} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
