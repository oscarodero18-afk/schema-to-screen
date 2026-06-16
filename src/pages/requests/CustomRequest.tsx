import React, { useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import * as Sonner from 'sonner';
import { Loader2, Mic, Upload, FileText } from 'lucide-react';

const CustomRequest: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    business_name: '',
    phone: '',
    email: '',
    location: '',
    industry: '',
    project_title: '',
    requested_service: '',
    detailed_requirements: '',
    business_challenges: '',
    expected_features: '',
    preferred_design_style: '',
    budget: '',
    timeline: '',
    priority_level: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (profile.role === 'agent' && !profile.agent_code) {
      Sonner.toast.error("Valid Agent Code required to submit request. Please contact admin.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabaseClient.from('custom_requests').insert({
        ...formData,
        agent_id: profile.id,
        budget: parseFloat(formData.budget) || 0,
        status: 'new_request'
      });

      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success('Custom request submitted to admin');
        navigate('/dashboard');
      }
    } catch (err) {
      Sonner.toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-2xl font-bold">Custom Solution Request</CardTitle>
          <CardDescription>Capture detailed customer requirements for tailored products or services.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 p-6">
            {/* Customer Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-6 w-1 bg-primary rounded-full" />
                Customer Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cust_name">Customer Name *</Label>
                  <Input 
                    id="cust_name" 
                    required 
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bus_name">Business Name</Label>
                  <Input 
                    id="bus_name" 
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc">Location</Label>
                  <Input 
                    id="loc" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ind">Industry</Label>
                  <Input 
                    id="ind" 
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Project Specifications Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-6 w-1 bg-primary rounded-full" />
                Project Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input 
                    id="title" 
                    required 
                    placeholder="e.g., E-commerce App for Retail Chain"
                    value={formData.project_title}
                    onChange={(e) => setFormData({...formData, project_title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Requested Service</Label>
                  <Select value={formData.requested_service} onValueChange={(val) => setFormData({...formData, requested_service: val})}>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Development">Software Development</SelectItem>
                      <SelectItem value="Web Application">Web Application</SelectItem>
                      <SelectItem value="Mobile App">Mobile App</SelectItem>
                      <SelectItem value="ERP Customization">ERP Customization</SelectItem>
                      <SelectItem value="Digital Transformation">Digital Transformation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority_level} onValueChange={(val) => setFormData({...formData, priority_level: val})}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (KES)</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input 
                    id="timeline" 
                    placeholder="e.g., 3 months"
                    value={formData.timeline}
                    onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reqs">Detailed Requirements</Label>
                <Textarea 
                  id="reqs" 
                  rows={4} 
                  placeholder="Describe what the customer wants in detail..."
                  value={formData.detailed_requirements}
                  onChange={(e) => setFormData({...formData, detailed_requirements: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="challenges">Business Challenges</Label>
                  <Textarea 
                    id="challenges" 
                    rows={3} 
                    placeholder="What problems are they trying to solve?"
                    value={formData.business_challenges}
                    onChange={(e) => setFormData({...formData, business_challenges: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Expected Features</Label>
                  <Textarea 
                    id="features" 
                    rows={3} 
                    placeholder="Key functionalities required..."
                    value={formData.expected_features}
                    onChange={(e) => setFormData({...formData, expected_features: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Media Uploads Placeholders */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Supporting Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" type="button" className="h-20 flex-col gap-2">
                  <Mic className="h-5 w-5" />
                  <span className="text-xs">Voice Note</span>
                </Button>
                <Button variant="outline" type="button" className="h-20 flex-col gap-2">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Photo</span>
                </Button>
                <Button variant="outline" type="button" className="h-20 flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Document</span>
                </Button>
                <Button variant="outline" type="button" className="h-20 flex-col gap-2">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">PDF</span>
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Voice notes and file uploads will be synchronized with Supabase Storage.</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold" 
              disabled={loading || (profile?.role === 'agent' && !profile?.agent_code)}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Submit Custom Request
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default CustomRequest;
