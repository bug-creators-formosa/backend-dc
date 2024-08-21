import { User } from './users/entities/user.entity';

declare global {
    namespace Express {
        export interface Request {
            user?: User;
        }
    }
}