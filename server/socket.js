import { Server } from "socket.io";

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // allow all for now, lock down in prod
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("joinVendorRoom", (vendorId) => {
            socket.join(vendorId);
            console.log(`Socket ${socket.id} joined vendor room: ${vendorId}`);
        });

        socket.on("updateLocation", (data) => {
            // Broadcast location to customers (or specific rooms)
            // For simplicity, broadcast to everyone listening for map updates
            io.emit("vendorLocationUpdate", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export { initSocket, getIO };
