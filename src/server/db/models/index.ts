export interface UsersTable {
    id?: number;
    email?: string;
    password?: string;
    banned?: 0 | 1;
    created_at?: Date;
}

export interface MysqlResponse {
    affectedRows: number;
    insertId: number;
}