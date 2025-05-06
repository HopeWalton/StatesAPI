const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');
const verifyStates = require('../middleware/verifyStates');

// Return all states
router.get('/', statesController.getAllStates);

// Return single state
router.get('/:state', verifyStates, statesController.getState);

// Return state and capital
router.get('/:state/capital', verifyStates, statesController.getCapital);

// Return state and nickname
router.get('/:state/nickname', verifyStates, statesController.getNickname);

// Return state and population
router.get('/:state/population', verifyStates, statesController.getPopulation);

// Return state and admission to the union
router.get('/:state/admission', verifyStates, statesController.getAdmission);

// Return random funfact
router.get('/:state/funfact', verifyStates, statesController.getFunfact);

// Post funfact
router.post('/:state/funfact', verifyStates, statesController.postFunfact);

// Patch funfact
router.patch('/:state/funfact', verifyStates, statesController.patchFunfact);

router.delete('/:state/funfact', verifyStates, statesController.deleteFunfact);


module.exports = router;