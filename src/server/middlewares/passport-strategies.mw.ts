import * as passport from 'passport';
import * as PassportLocal from 'passport-local';
import * as PassportJWT from 'passport-jwt';
import db from '../db';
import config from '../config';
import { Application } from 'express';
import { compareHash } from '../utils/passwords';
import { Payload } from '../types';

export function configurePassport(app: Application) {
	// req.session
	passport.serializeUser((user: Payload, done) => {
		done(null, user);
	});

	// req.user
	passport.deserializeUser((user: Payload, done) => {
		done(null, user);
	});

	passport.use(
		new PassportLocal.Strategy(
			{
				usernameField: 'email'
			},
			async (email, password, done) => {
				try {
					const [userFound] = await db.users.find('email', email);
					if (userFound && compareHash(password, userFound.password)) {
						delete userFound.password;
						done(null, userFound);
					} else {
						done(null, false);
					}
				} catch (error) {
					done(error);
				}
			}
		)
	);

	passport.use(
		new PassportJWT.Strategy(
			{
				jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
				secretOrKey: config.jwt.secret
			},
			async (payload: Payload, done) => {
				try {
					const [userRecord] = await db.users.find('id', payload.userid);
					
					if (userRecord && userRecord.banned === 0) {
						delete userRecord.password;
						done(null, userRecord);
					} else {
						done(null, false, { message: 'you banned lol' });
					}
				} catch (error) {
					done(error);
				}
			}
		)
	);

	app.use(passport.initialize());
}
