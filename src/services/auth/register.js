import { user } from '../../db/schema.js';
import { db } from '../../db/index.js';
import bcrypt from 'bcryptjs';

class RegisterService {
  async registerUser(userData) {
    try {

      const { fullName, userName, email, password, role, teamId } = userData;

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await db
        .insert(user)
        .values({
          fullName,
          userName,
          email,
          password: hashedPassword,
          role,
          teamId,
        })
        .returning({
          userId: user.userId,
          fullName: user.fullName,
          userName: user.userName,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          createAt: user.createAt,
          updateAt: user.updateAt,
        });
      return newUser[0];
    } catch (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }
}

export const registerService = new RegisterService();
