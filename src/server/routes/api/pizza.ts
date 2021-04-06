import { Router } from 'express';
import { tokenCheck } from '../../middlewares/auth.mw';
import { ReqUser } from '../../types';

const router = Router();

router.get('/', tokenCheck, (req: ReqUser, res) => {
	try {
		res.json({ message: `Enjoy your Pizza Time ${req.user.email}!` });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'my code sucks, let me know!', error: error.message });
	}
});

export default router;
