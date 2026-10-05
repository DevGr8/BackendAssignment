const router = require('express').Router();
const c = require('../controllers/electionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // every election route needs a valid JWT

router.get('/', c.listElections);
router.post('/', authorize('admin'), c.createElection);
router.get('/:id', c.getElection);
router.post('/:id/candidates', authorize('admin'), c.addCandidate);
router.post('/:id/vote', authorize('student'), c.castVote);
router.get('/:id/results', authorize('admin'), c.getResults);

module.exports = router;
