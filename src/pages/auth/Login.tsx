import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseClient } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Logo from '@/components/layout/Logo';
import * as Sonner from 'sonner';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success('Successfully logged in');
        navigate('/dashboard');
      }
    } catch (err) {
      Sonner.toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo className="h-12" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access the Sales Hub
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@vertex.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth/reset-password" title="forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
