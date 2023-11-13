const http = require("http");

const WebSocketServer = require("websocket").server;

const connections = new Map();

const httpServer = http.createServer((req, res) => {
  console.log("we have received a request");
});

const websocket = new WebSocketServer({
  httpServer: httpServer,
});

websocket.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  


  connection.on("open", e => {
    console.log(`Connection ID (opened): ${connection.remoteAddress}`);
    console.log(`Total Connections: ${connections.size}`); // Log the number of connected clients
  });
  connection.on("close", (reasonCode, description) => {
    for (const [clientId, conn] of connections) {
      if (conn === connection) {
        connections.delete(clientId);
        console.log(`Connection closed (total connections: ${connections.size})`);
        break;
      }
    }
  });
  connection.on("message", (message) => {
    if (message.type === "utf8") {
      console.log(`Received Message: ${message.utf8Data}`);

      parse(message, connection);
      // for (const client of connections) {
      //   console.log(client)
      //   if (client !== connection) {
      //     client.sendUTF(message.utf8Data);
      //   }
      // }
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



function parse( params, connection) {
  console.log(`Raw data: ${params.utf8Data}`);
  try {
      const parsedMessage = JSON.parse(params.utf8Data);
      const action = parsedMessage.action;
      console.log(`p - ${action}`);
      switch (action) {
          case 'join':
              Join(parsedMessage.receiver, connection);
              break;
          case 'single':
              SingleSend(parsedMessage.receiver, parsedMessage.data);
              break;
          default:
              SendALl(parsedMessage.data);
              break;
      }
  } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
  }
}

function Join( id , connection) {
  connections.set(id, connection);
  connection.send('Joined successful');
}
function SingleSend( receiverId , message) {
  for (const [clientId, conn] of connections) {
    if (clientId === receiverId) {
      conn.send(message);
      console.log(`message sent to ${clientId}`);
      break;
    }
  }
}
function SendALl( message ) {
  
  for (const [clientId, conn] of connections) {
   
      conn.send(message);
      console.log(`message sent to ${clientId}`);
      
  
  }
}