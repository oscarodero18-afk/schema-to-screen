import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Send, 
  ChevronDown,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportActionsProps {
  stats: any;
  recentSales: any[];
}

const ReportActions: React.FC<ReportActionsProps> = ({ stats, recentSales }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text('Vertex Tech Performance Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Agent: ${profile?.full_name}`, 14, 37);
    
    // Stats Summary
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Performance Summary', 14, 50);
    
    const statsData = [
      ['Total Revenue', `KSH ${stats.revenue.toLocaleString()}`],
      ['Earned Commissions', `KSH ${stats.commissions.toLocaleString()}`],
      ['Prospect Pipeline', stats.leads.toString()],
      ['Solution Requests', stats.requests.toString()],
      ['Approved Sales', stats.sales.toString()]
    ];
    
    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Sales History
    doc.setFontSize(16);
    doc.text('Recent Sales Activity', 14, doc.lastAutoTable.finalY + 15);
    
    const salesTableData = recentSales.map(sale => [
      new Date(sale.created_at).toLocaleDateString(),
      sale.customer?.name || 'N/A',
      sale.product?.name || 'N/A',
      `KSH ${sale.sale_price.toLocaleString()}`,
      sale.status.toUpperCase()
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Customer', 'Product', 'Amount', 'Status']],
      body: salesTableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    return doc;
  };

  const downloadPDF = async () => {
    setLoading('pdf');
    try {
      const doc = generatePDF();
      doc.save(`VertexReport_${new Date().getTime()}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(null);
    }
  };

  const downloadExcel = async () => {
    setLoading('excel');
    try {
      const ws = XLSX.utils.json_to_sheet([
        { Metric: 'Total Revenue', Value: stats.revenue },
        { Metric: 'Commissions', Value: stats.commissions },
        { Metric: 'Leads', Value: stats.leads },
        { Metric: 'Requests', Value: stats.requests },
        { Metric: 'Sales', Value: stats.sales },
      ]);
      
      const wsSales = XLSX.utils.json_to_sheet(recentSales.map(s => ({
        Date: new Date(s.created_at).toLocaleDateString(),
        Customer: s.customer?.name,
        Product: s.product?.name,
        Amount: s.sale_price,
        Status: s.status
      })));
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
      XLSX.utils.book_append_sheet(wb, wsSales, "Sales History");
      
      XLSX.writeFile(wb, `VertexReport_${new Date().getTime()}.xlsx`);
      toast.success('Excel report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate Excel');
    } finally {
      setLoading(null);
    }
  };

  const downloadCSV = async () => {
    setLoading('csv');
    try {
      const salesData = recentSales.map(s => ({
        Date: new Date(s.created_at).toLocaleDateString(),
        Customer: s.customer?.name,
        Product: s.product?.name,
        Amount: s.sale_price,
        Status: s.status
      }));
      
      const ws = XLSX.utils.json_to_sheet(salesData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `VertexReport_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate CSV');
    } finally {
      setLoading(null);
    }
  };

  const sendToAdmin = async (format: 'pdf' | 'excel' | 'csv') => {
    setLoading('sending');
    try {
      // 1. Generate the file content
      let fileBlob: Blob;
      let fileName: string;
      let fileType: string;

      if (format === 'pdf') {
        const doc = generatePDF();
        fileBlob = doc.output('blob');
        fileName = `Report_${profile?.full_name}_${Date.now()}.pdf`;
        fileType = 'pdf';
      } else {
        // For simplicity in this demo, we'll just send PDF to storage
        // In a real app, you'd generate the specific format
        const doc = generatePDF();
        fileBlob = doc.output('blob');
        fileName = `Report_${profile?.full_name}_${Date.now()}.pdf`;
        fileType = 'pdf';
      }

      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseClient
        .storage
        .from('reports')
        .upload(`${profile?.id}/${fileName}`, fileBlob);

      if (uploadError) throw uploadError;

      // 3. Create record in reports table
      const { error: dbError } = await supabaseClient
        .from('reports')
        .insert({
          agent_id: profile?.id,
          report_type: format,
          file_url: uploadData.path,
          status: 'sent'
        });

      if (dbError) throw dbError;

      toast.success('Report successfully shared with Admin');
    } catch (error: any) {
      toast.error(`Sharing failed: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary transition-all">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Generate Report
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Download Locally</DropdownMenuLabel>
          <DropdownMenuItem onClick={downloadPDF} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4 text-red-500" /> PDF Performance Matrix
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadExcel} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Excel Data Sheet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadCSV} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4 text-blue-500" /> CSV Raw Export
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Enterprise Share</DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => sendToAdmin('pdf')} 
            className="gap-2 cursor-pointer bg-primary/5 font-bold text-primary"
            disabled={loading === 'sending'}
          >
            {loading === 'sending' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send PDF to Admin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ReportActions;
