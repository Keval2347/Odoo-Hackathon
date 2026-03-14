import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';

export default function AuthPage() {
  const store = useStore();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('admin@coreinventory.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }

    try {
      store.login(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !name) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }

    try {
      store.signup(email, name, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Password reset link sent to your email.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary mb-4">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CoreInventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create a new account'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        <div className="surface-raised rounded-xl p-6">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Sign In</Button>
              <div className="text-center space-y-2 text-sm">
                <button type="button" onClick={() => { setMode('reset'); setError(''); }} className="text-primary hover:underline">Forgot password?</button>
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-primary hover:underline">Sign up</button>
                </p>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email2">Email</Label>
                <Input id="email2" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">Password</Label>
                <Input id="password2" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Create Account</Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-primary hover:underline">Sign in</button>
              </p>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email3">Email</Label>
                <Input id="email3" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Send Reset Link</Button>
              {message && <p className="text-sm text-center text-success">{message}</p>}
              <p className="text-center text-sm text-muted-foreground">
                <button type="button" onClick={() => { setMode('login'); setMessage(''); setError(''); }} className="text-primary hover:underline">Back to sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
