const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchProperties, createProperty, getProperty, updateProperty, deleteProperty,
  toggleFavorite, scheduleVisit, replyVisit, submitOffer, writeReview, getReviews,
  aiGenerateDescription, aiImageAnalysis, aiPricePrediction,
  aiNegotiate, aiInvestmentAnalysis, aiNeighborhoodAnalysis,
  aiChatAssistant, aiInteriorSuggestions,
} = require('../controllers/propertyController');

// AI utility routes
router.post('/ai/generate-description', protect, aiGenerateDescription);
router.post('/ai/image-analysis', protect, aiImageAnalysis);
router.post('/ai/price-prediction', protect, aiPricePrediction);
router.post('/ai/negotiate', protect, aiNegotiate);
router.post('/ai/interior-suggestions', protect, aiInteriorSuggestions);

// Property CRUD
router.get('/', searchProperties);
router.post('/', protect, createProperty);
router.get('/:id', getProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

// Property actions
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/visit', protect, scheduleVisit);
router.put('/visit/:visitId/reply', protect, replyVisit);
router.post('/:id/offers', protect, submitOffer);
router.post('/:id/reviews', protect, writeReview);
router.get('/:id/reviews', getReviews);

// AI per-property routes
router.get('/:id/ai/neighborhood', protect, aiNeighborhoodAnalysis);
router.get('/:id/ai/investment', protect, aiInvestmentAnalysis);
router.post('/:id/ai/chat', protect, aiChatAssistant);

module.exports = router;
