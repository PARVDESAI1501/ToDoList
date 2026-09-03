import { MongoClient } from "mongodb";

let clientInstance = null;
let dbInstance = null;

const connectDB = async () => {
  if (dbInstance) return dbInstance;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured in the backend .env file.");
  }

  const dbName = process.env.MONGODB_DB || "todo_db";
  const client = new MongoClient(uri);

  await client.connect();

  clientInstance = client;
  dbInstance = client.db(dbName);

  await dbInstance.collection("users").createIndex(
    { email: 1 },
    { unique: true, name: "user_email_unique_idx" },
  );

  await dbInstance.collection("todos").createIndex(
    { userId: 1, createdAt: -1 },
    { name: "user_todos_created_idx" },
  );

  console.log(
    `Connected to MongoDB and using database: ${dbInstance.databaseName}`,
  );

  return dbInstance;
};

const getDb = () => {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return dbInstance;
};

const closeDB = async () => {
  if (clientInstance) {
    await clientInstance.close();
    clientInstance = null;
    dbInstance = null;
  }
};

export { connectDB, getDb, closeDB };
