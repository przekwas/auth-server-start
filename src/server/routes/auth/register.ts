import * as jwt from 'jsonwebtoken';
import config from '../../config';
import db from '../../db';
import { Router } from 'express';
import { generateHash } from '../../utils/passwords';

const router = Router();

router.post('/', async (req, res) => {
	const newUser = req.body;
	try {
		newUser.password = generateHash(newUser.password);
		const result = await db.users.insert(newUser);
		const token = jwt.sign(
			{ userid: result.insertId, email: newUser.email, role: 1 },
			config.jwt.secret,
			{ expiresIn: config.jwt.expires }
		);
		res.json(token);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'my code sucks, let me know!' });
	}
});

export default router;
