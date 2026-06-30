import { User, UserDocument } from '../schema/users.schema';
import { BuildQueryDto } from '../../common/dto/base-query.dto';

export interface PaginatedUsers {
  results: number;
  pagination: any;
  data: UserDocument[];
}

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface IUsersRepository {
  // ── Queries ──────────────────────────────────────────────
  findByEmail(email: string): Promise<UserDocument | null>;
  findByEmailWithPassword(email: string): Promise<UserDocument | null>;
  findByEmailExcludingId(email: string, excludeId: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  findByIdWithPassword(id: string): Promise<UserDocument | null>;
  findAll(query: BuildQueryDto): Promise<PaginatedUsers>;

    findByEmailWithResetFields(
    email: string,
  ): Promise<UserDocument | null>

  // ── Mutations ─────────────────────────────────────────────
  create(data: Partial<User>): Promise<UserDocument>;
updateById(
  id: string,
  data: Partial<User>,
): Promise<UserDocument | null>;
  save(doc: UserDocument): Promise<UserDocument>;
  deleteOne(doc: UserDocument): Promise<void>;
}