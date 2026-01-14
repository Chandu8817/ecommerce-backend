import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: "ecommerce-96b62.firebasestorage.app", // ✅ exact bucket name
  });
}

export const bucket = admin.storage().bucket();