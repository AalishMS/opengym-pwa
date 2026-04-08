'use client';

import { useEffect, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/auth-guard';
import { api } from '@/lib/api/http';
import type { Session } from '@/types';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateVolume(session: Session) {
  return session.exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((setTotal, set) => setTotal + set.reps * set.weight, 0);
  }, 0);
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workout session?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/sessions/${id}`);
      await loadSessions();
    } catch (e) {
      console.error('Failed to delete session', e);
    } finally {
      setDeletingId(null);
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <AuthGuard>
        <div className="py-8 text-center font-mono text-muted-foreground">[ LOADING... ]</div>
      </AuthGuard>
    );
  }

  if (sessions.length === 0) {
    return (
      <AuthGuard>
        <div className="py-8 text-center font-mono text-muted-foreground">
          <Calendar className="mx-auto mb-4 size-12" />
          <p>NO SESSIONS YET</p>
          <p className="mt-2 text-sm">Log a workout to see it here</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        <h1 className="font-mono text-xl font-bold">[ HISTORY ]</h1>

        <div className="space-y-2">
          {sortedSessions.map((session) => {
            const isExpanded = expandedId === session.id;
            const volume = calculateVolume(session);

            return (
              <Card key={session.id} className="overflow-hidden">
                <div
                  className="flex cursor-pointer items-center justify-between p-4"
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                >
                  <div>
                    <p className="font-mono text-base font-bold">
                      {session.plan_name || 'UNNAMED WORKOUT'}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">
                      {formatDate(session.date)} • WEEK {session.week_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {volume.toLocaleString()} kg
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="border-t border-border pt-4">
                    <div className="space-y-3">
                      {session.exercises.map((ex, exIdx) => (
                        <div key={exIdx}>
                          <p className="font-mono text-sm font-bold">{ex.name}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {ex.sets.map((set, setIdx) => (
                              <span
                                key={setIdx}
                                className="font-mono text-xs text-muted-foreground"
                              >
                                {set.reps}×{set.weight}kg
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session.id);
                        }}
                        disabled={deletingId === session.id}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AuthGuard>
  );
}
