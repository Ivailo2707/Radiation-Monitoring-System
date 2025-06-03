const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const readingsRoute = require('./routes/readings');
const authRoute = require('./routes/auth');

dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let sockets = [];
wss.on('connection', socket => {
  sockets.push(socket);
  socket.on('close', () => {
    sockets = sockets.filter(s => s !== socket);
  });
});

function broadcast(data) {
  sockets.forEach(s => s.send(JSON.stringify(data)));
}

// Middleware
app.use(express.json());
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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  server.listen(5000, () => console.log('Server running on port 5000'));
});
