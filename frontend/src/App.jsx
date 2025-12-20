import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Capital from './pages/Capital';
import VoiceSales from './pages/VoiceSales';
import AccountOverview from './pages/AccountOverview';
import CashFlow from './pages/CashFlow';
import SupplierDetail from './pages/SupplierDetail';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/supplier/:id" element={<SupplierDetail />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/voice-sales" element={<VoiceSales />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/capital" element={<Capital />} />
              <Route path="/account-overview" element={<AccountOverview />} />
              <Route path="/cashflow" element={<CashFlow />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
