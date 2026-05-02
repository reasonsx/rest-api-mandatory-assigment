import mongoose from "mongoose";

export async function connectToDatabase() {
    try
     {
        if (!process.env.DBHOST) {
            throw new Error('DBHOST environment variable is not defined');
        }
        await mongoose.connect(process.env.DBHOST);

        if (mongoose.connection.db) {
            await mongoose.connection.db.admin().command({ ping: 1 });
            console.log('Successfully connected to the database');
        } else {
            throw new Error('Database connection is not established');
        }
    }
    catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit the application if the database connection fails
    }
}

export async function disconnectFromDatabase() {
    try {
        await mongoose.disconnect();
        console.log('Successfully disconnected from the database');
    } catch (error) {
        console.error('Failed to disconnect from the database:', error);
    }
}

// export async function testConnection() {
//     try {
//         await connectToDatabase();
//         await disconnectFromDatabase();
//         console.log('Database connection test successful (connect + disconnect)');
//     } catch (error) {
//         console.error('Database connection test failed:', error);
//         throw error;
//     }
// }