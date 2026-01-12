import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Overview of your account performance.</p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/dashboard">Back</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-elevated">
          <p className="text-sm text-muted-foreground">Followers Growth</p>
          <div className="text-2xl font-bold mt-2">+120</div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-elevated">
          <p className="text-sm text-muted-foreground">AutoDM Performance</p>
          <div className="text-2xl font-bold mt-2">3,412</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
