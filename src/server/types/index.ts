import { Request } from 'express';
import { UsersTable } from '../db/models';

export interface ReqUser extends Request {
	user?: Payload;
}

export interface Payload extends UsersTable {
	userid?: number;
	role?: number;
}