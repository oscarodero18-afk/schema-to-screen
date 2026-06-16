import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseClient } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Phone, Mail, BadgeCheck, Upload, Loader2, Key } from 'lucide-react';
import * as Sonner from 'sonner';
import { Badge } from '@/components/ui/badge';

const Profile: React.FC = () => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [requesting, setRequesting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!user) return;
      try {
        const { data } = await supabaseClient
          .from('code_requests' as any)
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();
        if (data) setHasPendingRequest(true);
      } catch (err) { /* silent fail if table missing */ }
    };
    checkPendingRequest();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success('Profile updated successfully');
      }
    } catch (err: any) {
      Sonner.toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async () => {
    if (!user) return;
    setRequesting(true);
    try {
      const { error } = await supabaseClient
        .from('code_requests' as any)
        .insert({ user_id: user.id, status: 'pending' });
      
      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success('Agent code request sent to admin');
        setHasPendingRequest(true);
      }
    } catch (err: any) {
      Sonner.toast.error(err.message || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 shadow-sm">
        <CardHeader className="text-center border-b bg-muted/30">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.full_name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{profile?.full_name}</CardTitle>
          <CardDescription className="capitalize font-medium text-primary flex items-center justify-center gap-1">
            <BadgeCheck className="h-4 w-4" /> {profile?.role}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent_code">Agent Code</Label>
                <div className="bg-muted p-3 rounded-md font-mono text-sm border flex justify-between items-center">
                  <span>{profile?.agent_code || (hasPendingRequest ? 'REQUEST_PENDING' : 'NOT_ASSIGNED')}</span>
                  {profile?.agent_code ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {hasPendingRequest ? 'Pending' : 'Required'}
                    </Badge>
                  )}
                </div>
                {!profile?.agent_code && !hasPendingRequest && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 border-primary/30 hover:bg-primary/5 text-primary"
                    onClick={handleRequestCode}
                    disabled={requesting}
                  >
                    {requesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Key className="h-3 w-3 mr-2" />}
                    Request Unique Agent Code
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground italic">Your unique identification code for sales recording.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    className="pl-10" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    className="pl-10 bg-muted/50" 
                    value={profile?.email || ''} 
                    disabled 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    className="pl-10" 
                    placeholder="+254..." 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t p-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;