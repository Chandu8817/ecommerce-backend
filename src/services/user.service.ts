// user.service.ts
// Handles business logic for user/auth with mobile OTP
import { IUser, IShippingAddress } from "../models/User";
import { AppError } from "../utils/AppError";
import { UserRepository } from "../repositories/user.repository";
import { GOOGLE_CLIENT_ID } from "../config/env";
import { OAuth2Client } from "google-auth-library";

const userRepository = new UserRepository();

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export class UserService {
  /**
   * Login / register with a Google ID token.
   * The frontend obtains the token via Google Sign-In and sends it here.
   * We verify it with Google, then upsert the user and return it.
   */
  async loginWithGoogle(idToken: string, role: string = "user") {
    if (!idToken || idToken.trim().length === 0) {
      throw new AppError(
        "MISSING_ID_TOKEN",
        "Google ID token is required",
        400,
        [{ field: "idToken", issue: "idToken cannot be empty" }]
      );
    }

    if (!GOOGLE_CLIENT_ID) {
      throw new AppError(
        "GOOGLE_NOT_CONFIGURED",
        "Google sign-in is not configured on the server",
        500
      );
    }

    // Verify the token signature, audience and expiry with Google.
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      throw new AppError(
        "INVALID_ID_TOKEN",
        "Invalid or expired Google token",
        401,
        [{ field: "idToken", issue: "Google token verification failed" }]
      );
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new AppError(
        "INVALID_ID_TOKEN",
        "Google token did not contain the required profile information",
        401
      );
    }

    if (payload.email_verified === false) {
      throw new AppError(
        "EMAIL_NOT_VERIFIED",
        "Google account email is not verified",
        403,
        [{ field: "email", issue: "Email must be verified with Google" }]
      );
    }

    const googleId = payload.sub;
    const email = payload.email;

    // 1) Match an existing Google-linked account.
    let user = await userRepository.findByGoogleId(googleId);

    // 2) Otherwise link to an existing account with the same email.
    if (!user) {
      user = await userRepository.findByEmail(email);
    }

    if (user) {
      // Keep the record in sync with Google.
      user.googleId = googleId;
      if (!user.email) user.email = email;
      if (!user.name && payload.name) user.name = payload.name;
      if (payload.picture) user.picture = payload.picture;
      await userRepository.save(user);
    } else {
      // 3) First-time sign-in: create the account.
      user = await userRepository.create({
        googleId,
        email,
        name: payload.name || "",
        picture: payload.picture,
        role: role as "user" | "admin" | undefined,
      });
    }

    return user;
  }

  /**
   * Update user details after OTP verification
   */
  async updateUserDetails(_id: string, userInput: Partial<IUser>) {
    const user = await userRepository.findById(_id);
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    // Allow updating name and email (phone cannot be changed)
    if (userInput.name) user.name = userInput.name;
    if (userInput.email) user.email = userInput.email;

    await userRepository.save(user);
    return user;
  }

  async getAuthUser(_id: string) {
    return userRepository.findById(_id);
  }

  async addShippingAddress(_id: string, shippingAddress: IShippingAddress) {
    const user = await userRepository.findById(_id);
    if (!user) throw new AppError("USER_NOT_FOUND", "User not found", 404);
    user.shippingAddress.push(shippingAddress);
    await userRepository.save(user);
    return user;
  }

  async removeShippingAddress(_id: string, id: number) {
    const user = await userRepository.findById(_id);
    if (!user) throw new AppError("USER_NOT_FOUND", "User not found", 404);
    user.shippingAddress.splice(id, 1);
    await userRepository.save(user);
    return user;
  }
}
