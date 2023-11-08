const http = require("http");

const WebSocketServer = require("websocket").server;

const connections = [];

const httpServer = http.createServer((req, res) => {
  console.log("we have received a request");
});

const websocket = new WebSocketServer({
  httpServer: httpServer,
});

websocket.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  connections.push(connection);


  connection.on("open", e => {
    console.log(`Connection ID (opened): ${connection.id}`);
  });
  connection.on("close", (reasonCode, description) => {
    const index = connections.indexOf(connection);
    if (index !== -1) {
      connections.splice(index, 1);
      console.log(`Connection closed (total connections: ${connections.length})`);
    }
  });
  connection.on("message", (message) => {
    if (message.type === "utf8") {
      console.log(`Received Message: ${message.utf8Data}`);

      for (const client of connections) {
        if (client !== connection) {
          client.sendUTF(message.utf8Data);
        }
      }
    }
  });

  // connection.on('send', message =>{
  //     sen
  // })
  //sendMessageEvery10Seconds(connection)
});

const serverIp = '192.168.0.109'
const serverPort = 8080

httpServer.listen(serverPort, serverIp, () => console.log("my server is listening"));

// function sendMessageEvery10Seconds(connection) {
//   setInterval(() => {
//     connection.send(`Hello from the server! ${connection} `);
//   }, 10000);
// }

// function sentOtherMessage(message) {
//   connection.send(message);
// }
