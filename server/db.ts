import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ [MongoDB Atlas] MONGODB_URI is not defined in .env file.');
    console.warn('ℹ️ [MongoDB Atlas] Running in offline fallback mode with local storage sync.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Atlas] Successfully connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.error('❌ [MongoDB Atlas] Connection failed:', err.message);
    return false;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});
