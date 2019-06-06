/*
Command words:

join: join a lobby

Planned:

join: create a lobby if it doesn't exist
leave: leave a lobby
name: change username
accept: accept someone to the lobby
reject: reject someone from the lobby
kick: kick someone out of the lobby

*/

class Command {
  static getCommand(message) {
    var commandWords = ["join", "leave", "name", "accept", "reject", "kick"];

    if (message[0] == '/') {
      var splitPos = message.length;
      var foundSpace;
      for (var i = 1; i < message.length; i++) {
        var char = message[i];
        if (char == " " && !foundSpace) {
          splitPos = i;
          foundSpace = true;
        }
      }
      // if (foundSpace) {
      var operator = message.substring(1, splitPos);
      var operand = message.substring(splitPos + 1, message.length);
      if (commandWords.includes(operator)) {
        return {
          operator: operator,
          operand: operand
        }
      }
      // }
    }
    return null;
  }

  static runCommand(operator, operand) {
    switch (operator) {
      case "join":
        return {
          command: "join",
          lobbyid: operand
        }
        // var lobby = getLobbyFromId(operand);
        // if (lobby) {
          // var sendData = lobby.addPlayer(socket.id);
          // socket.emit('joined lobby', sendData);
          // socket.join(data.lobbyid);
          // var userData = {
          //   name: data.name,
          //   lobbyid: data.lobbyid
          // }
          // users.set(socket.id, userData);

          // socket.broadcast.to(lobby.lobbyid).emit('player joined', users.get(socket.id).name);
        // }
        break;
      default:
        console.log("Unknown command: " + operator);
    }
  }
}

module.exports = Command;
