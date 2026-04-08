'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Dumbbell, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { AuthGuard } from '@/components/auth/auth-guard';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { api } from '@/lib/api/http';

interface Plan {
  id: string;
  name: string;
  exercises: { id: string; name: string; sets: number; order_index: number }[];
  synced: boolean;
}

export default function DashboardPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline, triggerSync } = useOnlineStatus();

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
    } catch {
      console.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [isOnline]);

  const handleSync = async () => {
    await triggerSync();
    await loadPlans();
  };

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold">[ PLANS ]</h1>
          {isOnline && (
            <Button variant="ghost" size="icon" onClick={handleSync}>
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground font-mono">
            [ LOADING... ]
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Dumbbell className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="mb-4 font-mono text-muted-foreground">NO PLANS YET</p>
              <Link href="/workouts?mode=create">
                <Button>
                  <Plus className="mr-2 size-4" />
                  [ CREATE PLAN ]
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => (
              <Link key={plan.id} href={`/workouts?planId=${plan.id}`}>
                <Card className="cursor-pointer transition-colors hover:bg-muted">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-mono text-base">{plan.name}</CardTitle>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="font-mono text-sm text-muted-foreground">
                      {plan.exercises.length} EXERCISES
                      {!plan.synced && <span className="text-destructive"> [PENDING]</span>}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Link href="/workouts?mode=create">
          <Button className="w-full">
            <Plus className="mr-2 size-4" />
            [ NEW PLAN ]
          </Button>
        </Link>

        <OfflineIndicator />
      </div>
    </AuthGuard>
  );
}
