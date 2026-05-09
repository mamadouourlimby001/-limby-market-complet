import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import LocationsList from './pages/LocationsList';
import LocationDetail from './pages/LocationDetail';
import AddLocation from './pages/AddLocation';
import AnnouncementsList from './pages/AnnouncementsList';
import AnnouncementDetail from './pages/AnnouncementDetail';
import AddAnnouncement from './pages/AddAnnouncement';
import BoutiquesList from './pages/BoutiquesList';
import BoutiqueDetail from './pages/BoutiqueDetail';
import CreateBoutique from './pages/CreateBoutique';
import AddBoutiqueProduct from './pages/AddBoutiqueProduct';
import MyBoutique from './pages/MyBoutique';
import BuyCredits from './pages/BuyCredits';
import RenewSubscription from './pages/RenewSubscription';
import UserDashboard from './pages/UserDashboard';
import SendMessageToAdmins from './pages/SendMessageToAdmins';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreditRequests from './pages/AdminCreditRequests';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminReports from './pages/AdminReports';
import AdminUsers from './pages/AdminUsers';
import AdminSendToUsers from './pages/AdminSendToUsers';
import AdminMessages from './pages/AdminMessages';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/occasion" element={<ProductsList />} />
            <Route path="/occasion/:id" element={<ProductDetail />} />
            <Route path="/occasion/ajouter" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/locations" element={<LocationsList />} />
            <Route path="/locations/:id" element={<LocationDetail />} />
            <Route path="/locations/ajouter" element={<ProtectedRoute><AddLocation /></ProtectedRoute>} />
            <Route path="/annonces" element={<AnnouncementsList />} />
            <Route path="/annonces/:id" element={<AnnouncementDetail />} />
            <Route path="/annonces/ajouter" element={<ProtectedRoute><AddAnnouncement /></ProtectedRoute>} />
            <Route path="/boutiques" element={<BoutiquesList />} />
            <Route path="/boutiques/:id" element={<BoutiqueDetail />} />
            <Route path="/boutiques/creer" element={<ProtectedRoute><CreateBoutique /></ProtectedRoute>} />
            <Route path="/boutiques/:id/ajouter-produit" element={<ProtectedRoute><AddBoutiqueProduct /></ProtectedRoute>} />
            <Route path="/ma-boutique" element={<ProtectedRoute><MyBoutique /></ProtectedRoute>} />
            <Route path="/credits/acheter" element={<ProtectedRoute><BuyCredits /></ProtectedRoute>} />
            <Route path="/credits/renouveler-abonnement" element={<ProtectedRoute><RenewSubscription /></ProtectedRoute>} />
            <Route path="/mon-compte" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/send-message-to-admins" element={<ProtectedRoute><SendMessageToAdmins /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/credits" element={<AdminRoute><AdminCreditRequests /></AdminRoute>} />
            <Route path="/admin/abonnements" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
            <Route path="/admin/signalements" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/send-to-users" element={<AdminRoute><AdminSendToUsers /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <BottomNav />
      </Router>
    </AuthProvider>
  );
}

export default App;
