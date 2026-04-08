'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/stores/auth';
import { getAccentOptions, getStoredAccentIndex, setStoredAccentIndex, applySelectedAccent } from '@/components/providers/accent-provider';
import { api } from '@/lib/api/http';
import { useToast } from '@/components/toast';

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border px-4 py-2">
      <p className="font-mono text-xs font-bold text-primary">&gt; {title}</p>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { logout } = useAuthStore();
  const accents = getAccentOptions();
  const [accentIndex, setAccentIndex] = useState(() => getStoredAccentIndex());
  const { showError, showSuccess, ToastComponent } = useToast();

  const handleAccentChange = (index: number) => {
    setAccentIndex(index);
    setStoredAccentIndex(index);
    applySelectedAccent(index, resolvedTheme !== 'light');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleClearData = async () => {
    if (!confirm('Clear all data? This cannot be undone.')) return;
    try {
      const [plansRes, sessionsRes] = await Promise.all([api.get('/plans'), api.get('/sessions')]);
      for (const session of sessionsRes.data) {
        await api.delete(`/sessions/${session.id}`);
      }
      for (const plan of plansRes.data) {
        await api.delete(`/plans/${plan.id}`);
      }
      showSuccess('All data cleared');
    } catch (e) {
      console.error('Failed to clear data', e);
      showError('Failed to clear data');
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-4">
        {ToastComponent}
        <h1 className="font-mono text-xl font-bold">[ SETTINGS ]</h1>

        <Card>
          <SectionHeader title="APPEARANCE" />
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="font-mono text-sm text-muted-foreground">THEME</p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="font-mono"
                >
                  DARK
                </Button>
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="font-mono"
                >
                  LIGHT
                </Button>
              </div>
            </div>

            <div>
              <p className="font-mono text-sm text-muted-foreground">ACCENT</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {accents.map((accent, index) => (
                  <button
                    key={accent.name}
                    type="button"
                    onClick={() => handleAccentChange(index)}
                    className={`border px-3 py-2 text-left ${
                      index === accentIndex ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <p className={`font-mono text-xs font-bold ${index === accentIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                      {accent.name}
                    </p>
                    <div className="mt-1 flex gap-1">
                      <span className="h-3 w-3 border border-border" style={{ backgroundColor: accent.dark }} />
                      <span className="h-3 w-3 border border-border" style={{ backgroundColor: accent.light }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="DATA" />
          <CardContent className="p-4">
            <Button variant="destructive" onClick={handleClearData} className="w-full font-mono">
              <Trash2 className="mr-2 size-4" />
              [ CLEAR ALL DATA ]
            </Button>
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="ACCOUNT" />
          <CardContent className="p-4">
            <Button variant="outline" onClick={handleLogout} className="w-full font-mono">
              <LogOut className="mr-2 size-4" />
              [ LOGOUT ]
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="font-mono text-xs text-muted-foreground">OPENGYM v1.0.0</p>
        </div>
      </div>
    </AuthGuard>
  );
}
