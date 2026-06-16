import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import * as Sonner from 'sonner';

const agentFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  agent_code: z.string().min(2, 'Agent code is required'),
  position: z.string().min(2, 'Position is required'),
  national_id: z.string().min(5, 'National ID is required'),
  employment_date: z.string(),
  status: z.enum(['active', 'suspended', 'deleted']),
  territory: z.string().optional(),
  target_sales_count: z.coerce.number().min(0).default(0),
  target_amount_ksh: z.coerce.number().min(0).default(0),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface AgentFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const AgentForm = ({ initialData, onSuccess, onCancel }: AgentFormProps) => {
  const { profile } = useAuth();
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema) as any,
    defaultValues: initialData || {
      full_name: '',
      email: '',
      phone: '',
      agent_code: '',
      position: '',
      national_id: '',
      employment_date: new Date().toISOString().split('T')[0],
      status: 'active',
      territory: '',
      target_sales_count: 0,
      target_amount_ksh: 0,
    },
  });

  const onSubmit = async (values: AgentFormValues) => {
    try {
      if (initialData) {
        const { error } = await supabaseClient
          .from('profiles')
          .update(values)
          .eq('id', initialData.id);

        if (error) throw error;
        Sonner.toast.success('Agent updated successfully');
      } else {
        const { error } = await supabaseClient
          .from('profiles')
          .insert([{ ...values, role: 'agent' }]);

        if (error) throw error;
        Sonner.toast.success('Agent invited successfully');
      }
      onSuccess();
    } catch (error: any) {
      Sonner.toast.error(error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agent_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Code</FormLabel>
                <FormControl><Input placeholder="VTS-001" {...field} disabled={profile?.role !== 'admin'} /></FormControl>
                <FormDescription>Unique identifier for the agent</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl><Input placeholder="+254..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl><Input placeholder="Sales Representative" {...field} disabled={profile?.role !== 'admin'} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="national_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>National ID</FormLabel>
                <FormControl><Input placeholder="12345678" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="territory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Territory</FormLabel>
                <FormControl><Input placeholder="Nairobi" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={profile?.role !== 'admin'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="target_sales_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Sales Target (Units)</FormLabel>
                <FormControl><Input type="number" {...field} disabled={profile?.role !== 'admin'} /></FormControl>
                <FormDescription>Set the monthly sales volume target</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="target_amount_ksh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Revenue Target (KSH)</FormLabel>
                <FormControl><Input type="number" {...field} disabled={profile?.role !== 'admin'} /></FormControl>
                <FormDescription>Set the monthly revenue target</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Agent Details</Button>
        </div>
      </form>
    </Form>
  );
};

export default AgentForm;