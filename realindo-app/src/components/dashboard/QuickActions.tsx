import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/lessons" className="block">
          <Button className="w-full" variant="default">
            📚 Continue Learning
          </Button>
        </Link>
        <Link href="/convert" className="block">
          <Button className="w-full" variant="outline">
            💰 Convert EXP to RINDO
          </Button>
        </Link>
        <Link href="/marketplace" className="block">
          <Button className="w-full" variant="outline">
            🛒 Go to Marketplace
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
