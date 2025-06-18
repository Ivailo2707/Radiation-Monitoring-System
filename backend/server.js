const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const readingsRoute = require('./routes/readings');
const authRoute = require('./routes/auth');
const cors = require('cors');
dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');
const {Reading} = require('./models/Reading');
const rateLimit = require('express-rate-limit');


// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',       
    'http://frontend:3000',        
    'http://your-production-domain.com' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));


app.use('/api/auth', authRoute);
app.use('/api/readings', (req, res, next) => {
  const origSend = res.send.bind(res);
  res.send = (body) => {
    try {
      const data = JSON.parse(body);
      if (data && data.alarm !== undefined) broadcast(data);
    } catch (e) {}
    return origSend(body);
  };
  next();
}, readingsRoute);

const port = new SerialPort({
  path: 'COM8',
  baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', async (data) => {
  const value = parseFloat(data.trim());
  if (!isNaN(value)) {
    const reading = new Reading({ value, timestamp: new Date() });
    await reading.save();
    broadcast({
      value,
      timestamp: reading.timestamp,
      alarm: value >= 0.3
    });
  } else {
    console.warn('Invalid data from serial:', data);
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(apiLimiter);
app.use('/api/auth', authLimiter);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  server.listen(5000, () => console.log('Server running on port 5000'));
});
