'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/auth-guard';
import { api } from '@/lib/api/http';
import type { Session } from '@/types';

interface VolumeData {
  date: string;
  volume: number;
}

export default function StatsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await api.get('/sessions');
        setSessions(res.data);
      } catch (e) {
        console.error('Failed to load sessions', e);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  const calculateVolume = (session: Session) => {
    return session.exercises.reduce((total, ex) => {
      return total + ex.sets.reduce((setTotal, set) => setTotal + set.reps * set.weight, 0);
    }, 0);
  };

  const getVolumeOverTime = (): VolumeData[] => {
    const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(session => ({
      date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: calculateVolume(session)
    }));
  };

  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((total, s) => total + calculateVolume(s), 0);
  const avgVolume = totalSessions > 0 ? Math.round(totalVolume / totalSessions) : 0;
  const volumeData = getVolumeOverTime();
  const maxVolume = Math.max(...volumeData.map(v => v.volume), 1);

  if (loading) {
    return (
      <AuthGuard>
        <div className="py-8 text-center font-mono text-muted-foreground">[ LOADING... ]</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        <h1 className="font-mono text-xl font-bold">[ STATS ]</h1>

        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-mono text-2xl font-bold">{totalSessions}</p>
              <p className="font-mono text-xs text-muted-foreground">SESSIONS</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-mono text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}t</p>
              <p className="font-mono text-xs text-muted-foreground">VOLUME</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-mono text-2xl font-bold">{avgVolume}</p>
              <p className="font-mono text-xs text-muted-foreground">AVG KG</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-base">VOLUME OVER TIME</CardTitle>
          </CardHeader>
          <CardContent>
            {volumeData.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground text-center py-8">NO DATA</p>
            ) : (
              <div className="flex h-40 items-end gap-1">
                {volumeData.map((v, i) => {
                  const height = (v.volume / maxVolume) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                        title={`${v.date}: ${v.volume.toLocaleString()} kg`}
                      />
                      <span className="font-mono text-[8px] text-muted-foreground truncate w-full text-center">
                        {v.date.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
