const express = require('express');
const router = express.Router();
const { createUser, loginUser, index, detail, updateUser, changePassword, getAdminAndStaff, getCustomers } = require('../controller/userController');
const { rating,getProductRatings } = require('../controller/ratingController');
const { getAllComments, createComment } = require('../controller/commentController');
const { insertOrUpdateKeyword, getProductByUserId } = require('../controller/searchHistoryController');
const { getProfile, updateProfile } = require('../controller/profileController');
const { createProduct, getAllProducts, getProductDetails, updateProduct, deleteProduct } = require('../controller/productController');
const { createBrand, getAllBrands, getBrandDetails, updateBrand } = require('../controller/brandController');
const { createCategory, getAllCategories, getCategoryDetails, updateCategory } = require('../controller/categoryController');
const { getAllSizeTables, getSizeTableDetails, updateSizeTable } = require('../controller/sizeTableController');
const { getAllSales, getSalesById, createSales, updateSales, getAllSalesComingSoon, getAllSalesActive } = require('../controller/salesController');
const { getSaleDetailsBySalesId, createSaleDetails, deleteSaleDetails, getAllSaleDetailsActive, getAllSaleDetailsComingSoon, deleteSaleDetailsByList } = require('../controller/saleDetailsController');
const { getStatusDetails, createStatus, deleteStatus, updateStatus, getAllStatus } = require('../controller/statusController');
const { createOrder, getAllOrders, getOrderDetails, getMyOrders, updateOrder, payment, cancelOrder } = require('../controller/orderController');
const auth = require("../middleware/authMiddleware");
const { createRole, getAllRoles, getRoleDetails, updateRole, deleteRole } = require('../controller/roleController');
const { getMyCart, addToCart, updateCartItem, removeCartItem } = require("../controller/cartController");
const { createInventory, getAllInventories, getInventoryDetails, getInventoryByProductId, updateInventory, addStock, removeStock } = require('../controller/inventoryController');
const { createMessage, getMessagesByUsers, getConversationList } = require('../controller/messageController');
const { createPayment, getAllPayments, getPaymentDetails, getMyPayments, updatePayment } = require('../controller/paymentController');
const { createReservation, getAllReservations, getReservationDetails, getReservationsByUserId, updateReservation, cancelReservation, transferReservation } = require('../controller/reservationController');

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/getAllUsers', auth.verifyToken, auth.isAdmin, index);
router.get('/getUserDetails/:id', auth.verifyToken, detail);
router.put('/updateUser/:id', auth.verifyToken, auth.isAdmin, updateUser);
router.put('/changePassword/:id', auth.verifyToken, changePassword);
router.get('/getAdminAndStaff', auth.verifyToken, getAdminAndStaff);
router.get('/getCustomers', auth.verifyToken, auth.isAdmin, getCustomers);

router.get('/getProfileDetails/:id', auth.verifyToken, getProfile);
router.put('/updateProfile/:id', auth.verifyToken, updateProfile);

router.post('/insertProduct', auth.verifyToken, auth.isAdmin, createProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductDetails/:id', getProductDetails);
router.put('/updateProduct/:id', auth.verifyToken, auth.isAdmin, updateProduct);
router.delete('/deleteProduct/:id', auth.verifyToken, auth.isAdmin, deleteProduct);

router.post('/insertBrand', auth.verifyToken, auth.isAdmin, createBrand);
router.get('/getAllBrands', getAllBrands);
router.get('/getBrandDetails/:id', auth.verifyToken, getBrandDetails);
router.put('/updateBrand/:id', auth.verifyToken, auth.isAdmin, updateBrand);

router.post('/insertCategory', auth.verifyToken, auth.isAdmin, createCategory);
router.get('/getAllCategories', getAllCategories);
router.get('/getCategoryDetails/:id', auth.verifyToken, getCategoryDetails);
router.put('/updateCategory/:id', auth.verifyToken, auth.isAdmin, updateCategory);

router.get('/getAllSizeTables', auth.verifyToken, auth.isAdmin, getAllSizeTables);
router.get('/getSizeTableDetails/:id', getSizeTableDetails);
router.put('/updateSizeTable/:id', auth.verifyToken, auth.isAdmin, updateSizeTable);

router.get('/getAllSales', getAllSales);
router.get('/getAllSalesActive', getAllSalesActive);
router.get('/getAllSalesComingSoon', getAllSalesComingSoon);
router.get('/getSalesById/:id', getSalesById);
router.post('/insertSales', auth.verifyToken, auth.isAdmin, createSales);
router.put('/updateSales/:id', auth.verifyToken, auth.isAdmin, updateSales);

router.get('/getSaleDetailsBySalesId/:id', getSaleDetailsBySalesId);
router.get('/getAllSaleDetailsActive', getAllSaleDetailsActive);
router.get('/getAllSaleDetailsComingSoon', getAllSaleDetailsComingSoon);
router.post('/insertSalesDetails', auth.verifyToken, auth.isAdmin, createSaleDetails);
router.delete('/deleteSaleDetails/:id', auth.verifyToken, auth.isAdmin, deleteSaleDetails);
router.delete('/deleteSaleDetailsByList', auth.verifyToken, auth.isAdmin, deleteSaleDetailsByList);

router.post('/insertStatus', auth.verifyToken, auth.isAdmin, createStatus);
router.get('/getAllStatus', auth.verifyToken, auth.isAdmin, getAllStatus);
router.get('/getStatusDetails/:id', auth.verifyToken, getStatusDetails);
router.put('/updateStatus/:id', auth.verifyToken, auth.isAdmin, updateStatus);
router.delete('/deleteStatus/:id', auth.verifyToken, auth.isAdmin, deleteStatus);

router.post('/insertOrder', auth.verifyToken, createOrder);
router.get('/getAllOrders', auth.verifyToken, auth.isAdmin, getAllOrders);
router.get('/getOrderDetails/:id', auth.verifyToken, getOrderDetails);
router.get('/my-orders', auth.verifyToken, getMyOrders);
router.put('/updateOrder/:id', auth.verifyToken, updateOrder);
router.put('/paymentOrder/:id', auth.verifyToken, payment);
router.put('/cancelOrder/:id', auth.verifyToken, cancelOrder);

router.post('/insertComment', auth.verifyToken, createComment);
router.get('/getAllComments/:id', getAllComments);

router.put('/insertOrUpdateKeyword', auth.verifyToken, insertOrUpdateKeyword);
router.get('/getProductByUserId/:id', auth.verifyToken, getProductByUserId);

router.put('/rating', auth.verifyToken, rating);
router.get('/getProductRatings/:id', getProductRatings);

router.post('/insertRole', auth.verifyToken, auth.isAdmin, createRole);
router.get('/getAllRoles', auth.verifyToken, auth.isAdmin, getAllRoles);
router.get('/getRoleDetails/:id', auth.verifyToken, auth.isAdmin, getRoleDetails);
router.put('/updateRole/:id', auth.verifyToken, auth.isAdmin, updateRole);
router.delete('/deleteRole/:id', auth.verifyToken, auth.isAdmin, deleteRole);

router.get("/my-cart", auth.verifyToken, getMyCart);
router.post("/addToCart", auth.verifyToken, addToCart);
router.put("/updateCartItem", auth.verifyToken, updateCartItem);
router.delete("/removeCartItem", auth.verifyToken, removeCartItem);

router.post('/insertInventory', auth.verifyToken, auth.isAdmin, createInventory);
router.get('/getAllInventories', auth.verifyToken, auth.isAdmin, getAllInventories);
router.get('/getInventoryDetails/:id', auth.verifyToken, getInventoryDetails);
router.get('/getInventoryByProductId/:id', getInventoryByProductId);
router.put('/updateInventory/:id', auth.verifyToken, auth.isAdmin, updateInventory);
router.put('/addStock/:id', auth.verifyToken, auth.isAdmin, addStock);
router.put('/removeStock/:id', auth.verifyToken, auth.isAdmin, removeStock);

router.post('/insertMessage', auth.verifyToken, createMessage);
router.get('/getMessages/:id', auth.verifyToken, getMessagesByUsers);
router.get('/getConversations', auth.verifyToken, getConversationList);

router.post('/insertReservation', auth.verifyToken, createReservation);
router.get('/getAllReservations', auth.verifyToken, auth.isAdmin, getAllReservations);
router.get('/getReservationDetails/:id', auth.verifyToken, getReservationDetails);
router.get('/getReservationsByUserId/:id', auth.verifyToken, getReservationsByUserId);
router.put('/updateReservation/:id', auth.verifyToken, updateReservation);
router.put('/cancelReservation/:id', auth.verifyToken, cancelReservation);
router.put('/transferReservation/:id', auth.verifyToken, transferReservation);

router.post('/insertPayment', auth.verifyToken, createPayment);
router.get('/getAllPayments', auth.verifyToken, auth.isAdmin, getAllPayments);
router.get('/getPaymentDetails/:id', auth.verifyToken, getPaymentDetails);
router.get('/my-payments', auth.verifyToken, getMyPayments);
router.put('/updatePayment/:id', auth.verifyToken, updatePayment);

module.exports = router;