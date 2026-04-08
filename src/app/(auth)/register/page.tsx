'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth';

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined });
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      router.replace('/');
    } catch {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-mono text-xl">&gt; REGISTER</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-mono text-sm" htmlFor="email">
                EMAIL
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="font-mono text-xs text-destructive">! {errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-mono text-sm" htmlFor="password">
                PASSWORD
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="font-mono text-xs text-destructive">! {errors.password}</p>
              )}
            </div>

            {error && (
              <p className="font-mono text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full font-mono"
              disabled={loading}
            >
              {loading ? '[ CREATING... ]' : '[ REGISTER ]'}
            </Button>

            <p className="text-center font-mono text-sm text-muted-foreground">
              HAVE ACCOUNT?{' '}
              <Link href="/login" className="text-primary hover:underline">
                LOGIN
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
