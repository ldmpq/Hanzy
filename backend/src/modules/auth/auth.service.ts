import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { users, userStreaks } from '../../shared/schema';
import { UserResponse } from '../../shared/types/user.type';
import { hashPassword, comparePassword } from '../../shared/utils/bcrypt.utility';
import { generateTokens, TokenPayload } from './auth.utility';
import { RegisterInput, LoginInput, UpdatePasswordInput } from './auth.validation';

export class AuthService {
  // HÀM NỘI BỘ: TỰ ĐỘNG CẬP NHẬT STREAK KHI USER MỞ APP HOẶC ĐĂNG NHẬP
  private static async updateUserStreak(userId: string) {
    const userStreak = await db.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId),
    });

    if (!userStreak) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 1. Nếu chuỗi đã được cập nhật vào hôm nay thì bỏ qua
    if (userStreak.lastStudyDate === todayStr) {
      return;
    }

    // 2. Tính toán Streak mới
    let newStreak = 1;

    if (userStreak.lastStudyDate === yesterdayStr) {
      newStreak = (userStreak.currentStreak || 0) + 1;
    }

    const newLongest = Math.max(newStreak, userStreak.longestStreak || 0);

    // 3. Lưu vào Database
    await db.update(userStreaks)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastStudyDate: todayStr,
      })
      .where(eq(userStreaks.userId, userId));
  }

  // 1. ĐĂNG KÝ TÀI KHOẢN MỚI
  static async register(input: RegisterInput): Promise<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password, displayName } = input;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      throw new Error('EMAIL_EXISTS: Email này đã được đăng ký trong hệ thống!');
    }

    const hashedPassword = await hashPassword(password);

    // Sử dụng Transaction để tạo đồng thời User và UserStreak
    const newUser = await db.transaction(async (tx) => {
      // 1.1. Insert User mới
      const [insertedUser] = await tx
        .insert(users)
        .values({
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          displayName: displayName || email.split('@')[0],
          currentHskLevel: 1,
          dailyGoal: 20,
        })
        .returning();

      // 1.2. Khởi tạo luôn bảng Streak cho user này, thiết lập chuỗi ngày 1 ngay khi tạo tài khoản
      const todayStr = new Date().toISOString().split('T')[0];
      await tx.insert(userStreaks).values({
        userId: insertedUser.id,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: todayStr,
      });

      return insertedUser;
    });

    const tokenPayload: TokenPayload = {
      userId: newUser.id,
      email: newUser.email,
    };
    const tokens = generateTokens(tokenPayload);

    const { passwordHash, ...userResponse } = newUser;

    return {
      user: userResponse,
      tokens,
    };
  }

  // 2. ĐĂNG NHẬP HỆ THỐNG
  static async login(input: LoginInput): Promise<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password } = input;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user || !user.passwordHash) {
      throw new Error('INVALID_CREDENTIALS: Email hoặc mật khẩu không chính xác!');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS: Email hoặc mật khẩu không chính xác!');
    }

    const [updatedUser] = await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();

    // KIỂM TRA VÀ CẬP NHẬT STREAK KHI ĐĂNG NHẬP
    await this.updateUserStreak(updatedUser.id);

    const tokenPayload: TokenPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
    };
    const tokens = generateTokens(tokenPayload);

    const { passwordHash, ...userResponse } = updatedUser;

    return {
      user: userResponse,
      tokens,
    };
  }

  // 3. CẤP LẠI ACCESS TOKEN (REFRESH TOKEN)
  static async refreshToken(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;

      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND: Tài khoản không còn tồn tại.');
      }

      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
      };

      return generateTokens(newPayload);
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN: Refresh token không hợp lệ hoặc đã hết hạn.');
    }
  }

  // 4. LẤY THÔNG TIN PROFILE HIỆN TẠI
  static async getMe(userId: string): Promise<UserResponse> {
    // KIỂM TRA VÀ CẬP NHẬT STREAK MỖI LẦN VÀO APP
    await this.updateUserStreak(userId);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        streak: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND: Không tìm thấy thông tin người dùng.');
    }

    const { passwordHash, ...userResponse } = user;
    return {
      ...userResponse,
      email: userResponse.email || `user_${user.id.toString().slice(0, 6)}@Leafyy.com`,
    };
  }

  // 5. CẬP NHẬT MẬT KHẨU
  static async updatePassword(userId: string, input: UpdatePasswordInput): Promise<void> {
    const { currentPassword, newPassword } = input;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.passwordHash) {
      throw new Error('USER_NOT_FOUND: Không tìm thấy thông tin người dùng.');
    }

    // Kiểm tra mật khẩu hiện tại có đúng không
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('INVALID_PASSWORD: Mật khẩu hiện tại không chính xác!');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await db.update(users)
      .set({ passwordHash: hashedNewPassword })
      .where(eq(users.id, userId));
  }

  // 6. Onboarding
  static async setupProfile(userId: string, currentHskLevel: number, targetHskLevel: number, learningGoals: string[],  dailyGoal: number): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND: Không tìm thấy thông tin người dùng.');
    }
    const finalGoals = Array.isArray(learningGoals) ? learningGoals : [];
    await db.update(users)
      .set({ 
        currentHskLevel,
        targetHskLevel,
        learningGoals: finalGoals,
        dailyGoal 
      })
      .where(eq(users.id, userId));
  }
}