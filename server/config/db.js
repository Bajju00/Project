import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifelink', {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useLocalDB = false;
  } catch (error) {
    console.warn(`\n[DB Warning] MongoDB Connection failed: ${error.message}`);
    console.warn(`[DB Warning] Switching server to local JSON Database fallback (/server/data/local_db.json)!\n`);
    global.useLocalDB = true;
  }
};

export default connectDB;
