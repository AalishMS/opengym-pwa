'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuthGuard } from '@/components/auth/auth-guard';
import { api } from '@/lib/api/http';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { addToPendingWrites } from '@/lib/db';
import { useToast } from '@/components/toast';
import type { Plan } from '@/types';

interface ExerciseForm {
  name: string;
  sets: number;
}

interface PlanForm {
  name: string;
  exercises: ExerciseForm[];
}

interface SessionSetForm {
  reps: number;
  weight: number;
}

interface SessionExerciseForm {
  name: string;
  sets: SessionSetForm[];
}

interface SessionForm {
  plan_name: string;
  week_number: number;
  exercises: SessionExerciseForm[];
}

export default function WorkoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOnline } = useOnlineStatus();
  const { showError, ToastComponent } = useToast();

  const mode = searchParams.get('mode') || 'log';
  const planId = searchParams.get('planId');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [planForm, setPlanForm] = useState<PlanForm>({ name: '', exercises: [{ name: '', sets: 3 }] });
  const [sessionForm, setSessionForm] = useState<SessionForm>({
    plan_name: '',
    week_number: 1,
    exercises: []
  });

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const plansRes = await api.get('/plans');
      setPlans(plansRes.data);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (mode === 'log' && plans.length > 0) {
      const selectedPlan = planId ? plans.find(p => p.id === planId) : plans[0];
      if (selectedPlan) {
        setSessionForm({
          plan_name: selectedPlan.name,
          week_number: 1,
          exercises: selectedPlan.exercises.map(ex => ({
            name: ex.name,
            sets: Array.from({ length: ex.sets }, () => ({ reps: 8, weight: 0 }))
          }))
        });
      }
    }
  }, [mode, plans, planId]);

  const handleCreatePlan = async () => {
    if (!planForm.name.trim()) return;
    setSaving(true);

    const payload = {
      name: planForm.name,
      exercises: planForm.exercises.map((ex, idx) => ({
        name: ex.name,
        sets: ex.sets,
        order_index: idx
      }))
    };

    try {
      if (isOnline) {
        await api.post('/plans', payload);
      } else {
        await addToPendingWrites('CREATE', 'plan', { id: crypto.randomUUID(), ...payload });
      }
      await loadData();
      router.push('/');
    } catch (e) {
      console.error('Failed to create plan', e);
      showError('Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  const handleLogSession = async () => {
    if (sessionForm.exercises.length === 0) return;
    setSaving(true);

    const payload = {
      plan_name: sessionForm.plan_name || undefined,
      date: new Date().toISOString(),
      week_number: sessionForm.week_number,
      exercises: sessionForm.exercises.map((ex, exIdx) => ({
        name: ex.name,
        note: null,
        order_index: exIdx,
        sets: ex.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
          rpe: null,
          note: null
        }))
      }))
    };

    try {
      if (isOnline) {
        await api.post('/sessions', payload);
      } else {
        await addToPendingWrites('CREATE', 'session', { id: crypto.randomUUID(), ...payload });
      }
      router.push('/history');
    } catch (e) {
      console.error('Failed to log session', e);
      showError('Failed to log session');
    } finally {
      setSaving(false);
    }
  };

  const addExerciseToPlan = () => {
    setPlanForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: 3 }]
    }));
  };

  const updatePlanExercise = (idx: number, field: keyof ExerciseForm, value: string | number) => {
    setPlanForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex)
    }));
  };

  const removePlanExercise = (idx: number) => {
    setPlanForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== idx)
    }));
  };

  const updateSessionSet = (exIdx: number, setIdx: number, field: keyof SessionSetForm, value: number) => {
    setSessionForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) => 
        ei === exIdx ? {
          ...ex,
          sets: ex.sets.map((set, si) => si === setIdx ? { ...set, [field]: value } : set)
        } : ex
      )
    }));
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="py-8 text-center font-mono text-muted-foreground">[ LOADING... ]</div>
      </AuthGuard>
    );
  }

  if (mode === 'create') {
    return (
      <AuthGuard>
        {ToastComponent}
        <div className="space-y-4">
          <h1 className="font-mono text-xl font-bold">[ NEW PLAN ]</h1>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-base">PLAN NAME</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={planForm.name}
                onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., PUSH DAY"
                className="font-mono"
              />
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h2 className="font-mono text-sm font-bold text-muted-foreground">[ EXERCISES ]</h2>
            {planForm.exercises.map((ex, idx) => (
              <Card key={idx}>
                <CardContent className="flex items-center gap-2 pt-4">
                  <Input
                    value={ex.name}
                    onChange={(e) => updatePlanExercise(idx, 'name', e.target.value)}
                    placeholder="Exercise name"
                    className="flex-1 font-mono"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      value={ex.sets}
                      onChange={(e) => updatePlanExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                      className="w-16 font-mono text-center"
                    />
                    <span className="font-mono text-sm text-muted-foreground">SETS</span>
                  </div>
                  {planForm.exercises.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removePlanExercise(idx)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={addExerciseToPlan}>
              <Plus className="mr-2 size-4" />
              [ ADD EXERCISE ]
            </Button>
            <Button onClick={handleCreatePlan} disabled={saving || !planForm.name.trim()}>
              <Save className="mr-2 size-4" />
              {saving ? '[ SAVING... ]' : '[ SAVE PLAN ]'}
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {ToastComponent}
      <div className="space-y-4">
        <h1 className="font-mono text-xl font-bold">[ LOG WORKOUT ]</h1>

        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="font-mono text-muted-foreground">NO PLANS AVAILABLE</p>
              <Button className="mt-4" onClick={() => router.push('/workouts?mode=create')}>
                [ CREATE PLAN ]
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-base">SELECT PLAN</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={sessionForm.plan_name}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, plan_name: e.target.value }))}
                  className="w-full border border-input bg-background px-3 py-2 font-mono text-sm"
                >
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.name}>{plan.name}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">WEEK</span>
              <Input
                type="number"
                min={1}
                value={sessionForm.week_number}
                onChange={(e) => setSessionForm(prev => ({ ...prev, week_number: parseInt(e.target.value) || 1 }))}
                className="w-20 font-mono text-center"
              />
            </div>

            <div className="space-y-2">
              <h2 className="font-mono text-sm font-bold text-muted-foreground">[ EXERCISES ]</h2>
              {sessionForm.exercises.map((ex, exIdx) => (
                <Card key={exIdx}>
                  <CardHeader>
                    <CardTitle className="font-mono text-base">{ex.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground w-12">SET {setIdx + 1}</span>
                        <Input
                          type="number"
                          min={0}
                          value={set.reps}
                          onChange={(e) => updateSessionSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-20 font-mono text-center"
                          placeholder="REPS"
                        />
                        <Input
                          type="number"
                          min={0}
                          value={set.weight}
                          onChange={(e) => updateSessionSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-24 font-mono text-center"
                          placeholder="WEIGHT"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={handleLogSession} disabled={saving} className="w-full">
              <Save className="mr-2 size-4" />
              {saving ? '[ SAVING... ]' : '[ FINISH WORKOUT ]'}
            </Button>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
