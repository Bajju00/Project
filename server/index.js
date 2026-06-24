import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRouter from './routes/auth.js';
import hospitalsRouter from './routes/hospitals.js';
import ambulancesRouter from './routes/ambulances.js';
import donorsRouter from './routes/donors.js';
import emergenciesRouter from './routes/emergencies.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Bindings
app.use('/api/auth', authRouter);
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/ambulances', ambulancesRouter);
app.use('/api/donors', donorsRouter);
app.use('/api/emergencies', emergenciesRouter);

app.get('/', (req, res) => {
  res.send('LifeLink API service is active and running.');
});

// Global Error Handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
