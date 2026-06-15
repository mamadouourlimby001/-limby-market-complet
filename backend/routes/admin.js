const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const isSupremeAdmin = require('../middleware/isSupremeAdmin');
const {
  getCreditRequests, approveCreditRequest, rejectCreditRequest,
  getSubscriptionRequests, approveSubscriptionRequest, rejectSubscriptionRequest,
  getReports, handleReport, getUsers, deleteUser, addCredits, removeCredits, setVerified,
  setBoutiqueActive, setBoutiqueVerified, renewBoutique,
  addAdmin, removeAdmin, getDashboardStats,
  getAllBoutiques, deleteBoutique, activateBoutique, deactivateBoutique, certifyBoutique, resetDashboardStats,
  getBoutiqueDetailStats, getUsersWithSecurityQuestions, resetUserPassword,
  getVisites, getVisiteDetails, trackPageVisit
} = require('../controllers/adminController');

// Toutes les routes admin nécessitent auth + isAdmin
router.use(auth, isAdmin);

router.get('/credit-requests', getCreditRequests);
router.post('/credit-requests/:id/approve', approveCreditRequest);
router.post('/credit-requests/:id/reject', rejectCreditRequest);
router.get('/subscription-requests', getSubscriptionRequests);
router.post('/subscription-requests/:id/approve', approveSubscriptionRequest);
router.post('/subscription-requests/:id/reject', rejectSubscriptionRequest);
router.get('/reports', getReports);
router.post('/reports/:id/handle', handleReport);
router.get('/users', getUsers);
router.get('/users-security', getUsersWithSecurityQuestions);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/add-credits', addCredits);
router.post('/users/:id/remove-credits', removeCredits);
router.post('/users/:id/set-verified', setVerified);
router.post('/users/:id/reset-password', resetUserPassword);
router.post('/boutiques/:id/set-active', setBoutiqueActive);
router.post('/boutiques/:id/set-verified', setBoutiqueVerified);
router.post('/boutiques/:id/renew', renewBoutique);
router.get('/boutiques', getAllBoutiques);
router.delete('/boutiques/:id', deleteBoutique);
router.put('/boutiques/:id/activate', activateBoutique);
router.put('/boutiques/:id/deactivate', deactivateBoutique);
router.put('/boutiques/:id/certify', certifyBoutique);
router.get('/boutiques/:id/stats', getBoutiqueDetailStats);
router.post('/reset-stats', resetDashboardStats);
router.get('/dashboard-stats', getDashboardStats);
router.get('/visites', getVisites);
router.get('/visites/:id', getVisiteDetails);
router.post('/track-page-visit', trackPageVisit);

// Routes admin suprême uniquement
router.post('/admins/add', isSupremeAdmin, addAdmin);
router.delete('/admins/:id', isSupremeAdmin, removeAdmin);

module.exports = router;
