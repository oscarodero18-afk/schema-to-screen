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

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Admin logic: only this email gets admin role
    const role = email.toLowerCase() === 'oscarodero@tech-center.com' ? 'admin' : 'agent';

    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success('Account created! Please check your email.');
        navigate('/auth/login');
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
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join Vertex Tech Solutions as a Sales Agent or Admin
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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
              Sign Up
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
