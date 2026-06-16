import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Auth Pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';

// Layout
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import Leads from '@/pages/crm/Leads';
import Customers from '@/pages/crm/Customers';
import Products from '@/pages/products/Products';
import ProductDetails from '@/pages/products/ProductDetails';
import SalesRecording from '@/pages/crm/SalesRecording';
import CustomRequest from '@/pages/requests/CustomRequest';
import Commissions from '@/pages/commissions/Commissions';
import Renewals from '@/pages/renewals/Renewals';
import AdminPanel from '@/pages/admin/AdminPanel';
import Profile from '@/pages/profile/Profile';
import AgentManagement from '@/components/admin/AgentManagement';
import Chat from '@/pages/chat/Chat';
import ConversationList from '@/pages/chat/ConversationList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/sales" element={<SalesRecording />} />
              <Route path="/requests" element={<CustomRequest />} />
              <Route path="/commissions" element={<Commissions />} />
              <Route path="/renewals" element={<Renewals />} />
              <Route path="/agents" element={<ProtectedRoute requiredRole="admin"><AgentManagement /></ProtectedRoute>} />
              <Route path="/profile" element={<Profile />} />
              
              <Route path="/chat" element={<ConversationList />} />
              <Route path="/chat/:id" element={<Chat />} />
              
              {/* Admin Only */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
            </Route>

            {/* Default Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" closeButton richColors />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;