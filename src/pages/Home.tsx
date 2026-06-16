import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Database } from 'lucide-react';
import * as Sonner from 'sonner';

const Home: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying connection...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Since the DB might be empty, we try a query that will likely fail with "relation does not exist"
        // but proves we reached the API.
        const { error } = await supabaseClient.from('_connection_test').select('*').limit(1);
        
        if (error) {
          // "relation does not exist" (42P01) means we are connected but the table isn't there.
          // This is expected for a greenfield project.
          if (error.code === '42P01') {
            setStatus('connected');
            setMessage('Connected to Supabase (Greenfield)');
            Sonner.toast.success('Successfully connected to Supabase');
          } else {
            setStatus('error');
            setMessage(error.message);
            Sonner.toast.error(`Connection Error: ${error.message}`);
          }
        } else {
          // If by any chance the table exists and it returns data
          setStatus('connected');
          setMessage('Connected to Supabase');
          Sonner.toast.success('Successfully connected to Supabase');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Unknown connection error');
        Sonner.toast.error('Failed to connect to Supabase');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Project Initialization</CardTitle>
          <CardDescription>
            Verifying your database connection and environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-background p-8 text-center shadow-sm">
            {status === 'loading' && (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{message}</p>
              </>
            )}
            
            {status === 'connected' && (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div className="space-y-1">
                  <p className="font-semibold text-green-600">Successfully Connected</p>
                  <p className="text-xs text-muted-foreground">{message}</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ready to Build
                </Badge>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-8 w-8 text-destructive" />
                <div className="space-y-1">
                  <p className="font-semibold text-destructive">Connection Failed</p>
                  <p className="text-xs text-muted-foreground">{message}</p>
                </div>
                <Badge variant="destructive">Configuration Issue</Badge>
              </>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Once connectivity is confirmed, you can start building your schema and UI components.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
