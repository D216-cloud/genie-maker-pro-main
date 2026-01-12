import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Clock, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const mockInvoices = [
  { id: 'inv_001', date: new Date(), amount: 29, status: 'Paid' },
  { id: 'inv_002', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), amount: 29, status: 'Paid' },
  { id: 'inv_003', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), amount: 29, status: 'Paid' },
];

const Payments = () => {
  const { user } = useAuth();
  const [defaultMethod] = useState({ brand: 'Visa', last4: '4242', exp: '12/26' });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Payments</h1>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Premium</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">Manage billing, payment methods, and invoices for your premium plan.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => window.location.href = '/dashboard/billing'} className="bg-amber-500 text-white">Manage Plan</Button>
          <Button variant="outline" onClick={() => window.open('/support', '_blank')}>Contact Support</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-elevated">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold text-foreground">Genie Maker Premium</p>
              <p className="text-sm text-muted-foreground mt-1">Billed monthly - $29 / month</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next bill</p>
              <p className="font-semibold">{format(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Payment Method</h3>
            <div className="flex items-center justify-between gap-4 p-3 border border-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-10 bg-muted/10 rounded-md flex items-center justify-center text-muted-foreground">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">{defaultMethod.brand} ending •••• {defaultMethod.last4}</p>
                  <p className="text-xs text-muted-foreground">Expires {defaultMethod.exp}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Change</Button>
                <Button size="sm" onClick={() => alert('Downloaded card on file')}>Download</Button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Billing History</h3>
            <div className="space-y-3">
              {mockInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Invoice {inv.id}</p>
                    <p className="text-xs text-muted-foreground">{format(inv.date, 'MMM d, yyyy')} • ${inv.amount}.00</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{inv.status}</span>
                    <Button size="sm" variant="ghost" onClick={() => alert('Download invoice')}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl p-4 bg-card border border-muted/10 shadow-sm">
          <h4 className="text-sm font-semibold">Billing Summary</h4>
          <p className="text-sm text-muted-foreground mt-2">You are currently on the Premium plan. Your subscription includes priority support and premium features.</p>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Active since</p>
            <p className="font-medium">{format(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), 'MMM d, yyyy')}</p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Billing contact</p>
            <p className="font-medium">{user?.email || '—'}</p>
          </div>

          <div className="mt-5">
            <Button className="w-full bg-amber-500 text-white">Manage Subscription</Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Payments;
