/*
Command words:

join: join a lobby
leave: leave a lobby
name: change username

Planned:

Nothing right now

*/

class Command {
  static getCommand(message) {
    var commandWords = ["join", "create", "leave", "name"];

    // Forward slash means the message might be a command
    if (!(message[0] == '/')) return null;

    // Remove the '/' prefix and split the message into words
    var messageWords = message.slice(1).split(' ');

    var operator = messageWords.shift();
    var operand = messageWords.join(' ');

    if (commandWords.includes(operator)) {
      return {
        operator: operator,
        operand: operand
      }
    }

    return null;

    // UNUSED CODE BELOW
    // Forward slash means the message might be a command
    if (message[0] == '/') {
      // Location of space splitting operator and operand
      var splitPos = message.length;
      var foundSpace;
      // Find the first space in the message
      for (var i = 1; i < message.length; i++) {
        var char = message[i];
        if (char == " " && !foundSpace) {
          splitPos = i;
          foundSpace = true;
        }
      }
      // Split the message into two
      var operator = message.substring(1, splitPos);
      var operand = message.substring(splitPos + 1, message.length);
      // If a valid command word is used
      if (commandWords.includes(operator)) {
        return {
          operator: operator,
          operand: operand
        }
      }
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
        break;
      default:
        console.log("Unknown command: " + operator);
    }
  }
}

module.exports = Command;
