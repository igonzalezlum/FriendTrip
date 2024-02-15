const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');

const tripsRoutes = require('./routes/tripsRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const UserProfileShow = require('./models/UserProfileShow');
const solicitudeRoutes = require('./routes/solicitudeRoutes');
const userProfileShowRoutes = require('./routes/userProfileShowRoutes')

const app = express();
const { Server } = require("socket.io");

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/friendTrip', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});

// API ROUTES
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/trips', tripsRoutes);
app.use('/solicitudes', solicitudeRoutes);
app.use('/userProfileShow', userProfileShowRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data.room);
        console.log(`User with ID: ${data.userID} joined room: ${data.room}`);
    });

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("recieve_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected ", socket.id);
    });
});

server.listen(5000, () => { console.log("Server started on port 5000"); });