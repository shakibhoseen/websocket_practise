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

  connection.on("open", (e) => {
    console.log(`Connection ID (opened): ${connection.remoteAddress}`);
    console.log(`Total Connections: ${connections.size}`); // Log the number of connected clients
  });
  connection.on("close", (reasonCode, description) => {
    for (const [clientId, conn] of connections) {
      if (conn === connection) {
        connections.delete(clientId);
        console.log(
          `Connection closed (total connections: ${connections.size})`
        );
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

const serverIp = "192.168.0.109";
const serverPort = 8080;

httpServer.listen(serverPort, serverIp, () =>
  console.log("my server is listening")
);

// function sendMessageEvery10Seconds(connection) {
//   setInterval(() => {
//     connection.send(`Hello from the server! ${connection} `);
//   }, 10000);
// }

// function sentOtherMessage(message) {
//   connection.send(message);
// }

function parse(params, connection) {
  console.log(`Raw data: ${params.utf8Data}`);
  try {
    const parsedMessage = JSON.parse(params.utf8Data);
    const action = parsedMessage.action;
    console.log(`p - ${action}`);
    switch (action) {
      case "join":
        Join(parsedMessage.receiver, connection, parsedMessage.data); // data use a device name
        break;
      case "single":
        SingleSend(parsedMessage.receiver, connection, parsedMessage.data);
        break;
      default:
        SendALl(parsedMessage.data, connection);
        break;
    }
  } catch (error) {
    console.error(`Error parsing JSON: ${error}`);
  }
}

function Join(id, connection, deviceName) {
  const newUser = new User(connection, id, deviceName);
  connections.set(id, newUser);
  sent(newUser, "Joined successful");
  console.log(connections.size);
}
function SingleSend(receiverId, connection, message) {
  let senderUser;
  for (const [clientId, user] of connections) {
    if (user.connection == connection) {
      senderUser = user;
      break;
    }
  }
  console.log('sender user')
  console.log(senderUser);
  if (senderUser != null)
    if (connections.has(receiverId)) {
      const receiverUser = connections.get(receiverId);

      const modifyUser = new User(
        receiverUser.connection,
        senderUser.id,
        senderUser.deviceName
      );
      sent(modifyUser, message);
    }
}
function SendALl(message, connection) {
 let senderUser;
  for (const [clientId, user] of connections) {
    if (user.connection == connection) {
      senderUser = user;
      break;
    }
  }
  if (senderUser != null)
    for (const [clientId, receiverUser] of connections) {
      const modifyUser = new User(
        receiverUser.connection,
        senderUser.id,
        senderUser.deviceName
      );
      sent(modifyUser, message);
    }
}

function sent(user, message) {
  console.log(user);
  const payload = {
    id: user.id,
    device: user.deviceName,
    message: message,
  };

  user.connection.send(JSON.stringify(payload));
}

class User {
  constructor(connection, id, deviceName) {
    this.connection = connection;
    this.id = id;
    this.deviceName = deviceName;
  }
}
