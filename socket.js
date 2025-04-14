let io;
// Exports an object with two functions: init and getIo.
module.exports = {
  //^ call this once when your server starts.
  //Takes an HTTP server as input (usually created using http.createServer() or from an Express app).
  init: (httpServer) => {
    // Initializes the Socket.IO server by passing the HTTP server to it.
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "http://localhost:3000", // your frontend origin
        methods: ["GET", "POST", "DELETE"],
      },
    });
    return io;
  },

  // ^ You use this in other parts of your app to access the same socket.io instance.
  //Returns the already-initialized Socket.IO instance (io)
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io isn't initialized");
    }
    return io;
  },
};
