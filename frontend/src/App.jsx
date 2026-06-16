import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LocationPermissionModal from './components/LocationPermissionModal';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
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
import ProductBoutiqueDetail from './pages/ProductBoutiqueDetail';
import CreateBoutique from './pages/CreateBoutique';
import AddBoutiqueProduct from './pages/AddBoutiqueProduct';
import MyBoutique from './pages/MyBoutique';
import MesCommandes from './pages/MesCommandes';
import ProduitsCommandes from './pages/ProduitsCommandes';
import BuyCredits from './pages/BuyCredits';
import RenewSubscription from './pages/RenewSubscription';
import UserDashboard from './pages/UserDashboard';
import SendMessageToAdmins from './pages/SendMessageToAdmins';
import UserBoutiqueMessages from './pages/UserBoutiqueMessages';
import BoutiqueMessages from './pages/BoutiqueMessages';
import AdminDashboard from './pages/AdminDashboard';
import AdminBoutiques from './pages/AdminBoutiques';
import AdminBoutiqueDetail from './pages/AdminBoutiqueDetail';
import AdminResetStats from './pages/AdminResetStats';
import AdminCreditRequests from './pages/AdminCreditRequests';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminReports from './pages/AdminReports';
import AdminUsers from './pages/AdminUsers';
import AdminSendToUsers from './pages/AdminSendToUsers';
import AdminPasswords from './pages/AdminPasswords';
import AdminMessages from './pages/AdminMessages';
import AdminVisites from './pages/AdminVisites';
import AdminVisiteDetails from './pages/AdminVisiteDetails';
import NotFound from './pages/NotFound';
import useTrackVisit from './utils/useTrackVisit';
import './index.css';

function TrackingWrapper({ children }) {
  useTrackVisit();
  return children;
}

function AppContent() {
  const { user } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  useEffect(() => {
    if (user && !hasShownModal && !localStorage.getItem('locationPermissionAsked')) {
      setShowLocationModal(true);
      setHasShownModal(true);
    }
  }, [user, hasShownModal]);

  return (
    <>
      {showLocationModal && (
        <LocationPermissionModal onClose={() => setShowLocationModal(false)} />
      )}
      <Navbar />
      <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
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
            <Route path="/boutiques/:boutiqueId/produits/:productId" element={<ProductBoutiqueDetail />} />
            <Route path="/boutiques/:id" element={<BoutiqueDetail />} />
            <Route path="/boutiques/creer" element={<ProtectedRoute><CreateBoutique /></ProtectedRoute>} />
            <Route path="/boutiques/:id/ajouter-produit" element={<ProtectedRoute><AddBoutiqueProduct /></ProtectedRoute>} />
            <Route path="/ma-boutique" element={<ProtectedRoute><MyBoutique /></ProtectedRoute>} />
            <Route path="/mes-commandes" element={<ProtectedRoute><MesCommandes /></ProtectedRoute>} />
            <Route path="/boutique-commandes" element={<ProtectedRoute><ProduitsCommandes /></ProtectedRoute>} />
            <Route path="/credits/acheter" element={<ProtectedRoute><BuyCredits /></ProtectedRoute>} />
            <Route path="/credits/renouveler-abonnement" element={<ProtectedRoute><RenewSubscription /></ProtectedRoute>} />
            <Route path="/mon-compte" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/send-message-to-admins" element={<ProtectedRoute><SendMessageToAdmins /></ProtectedRoute>} />
            <Route path="/messages-boutiques" element={<ProtectedRoute><UserBoutiqueMessages /></ProtectedRoute>} />
            <Route path="/boutique-messages-inbox" element={<ProtectedRoute><BoutiqueMessages /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/credits" element={<AdminRoute><AdminCreditRequests /></AdminRoute>} />
            <Route path="/admin/abonnements" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
            <Route path="/admin/signalements" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/boutiques" element={<AdminRoute><AdminBoutiques /></AdminRoute>} />
            <Route path="/admin/boutique/:id/bilan" element={<AdminRoute><AdminBoutiqueDetail /></AdminRoute>} />
            <Route path="/admin/reset-stats" element={<AdminRoute><AdminResetStats /></AdminRoute>} />
            <Route path="/admin/send-to-users" element={<AdminRoute><AdminSendToUsers /></AdminRoute>} />
            <Route path="/admin/passwords" element={<AdminRoute><AdminPasswords /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
            <Route path="/admin/visites" element={<AdminRoute><AdminVisites /></AdminRoute>} />
            <Route path="/admin/visites/:id" element={<AdminRoute><AdminVisiteDetails /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <BottomNav />
      </>
    );
  }

function App() {
  return (
    <AuthProvider>
      <Router>
        <TrackingWrapper>
          <AppContent />
        </TrackingWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;
