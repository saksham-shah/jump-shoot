class Action {
  constructor(type, player, control) {
    this.type = type;
    this.player = player;
    this.control = control;
  }

  execute(controls) {
    var bool;
    if (this.type == "startPress") {
      bool = true;
    } else if (this.type == "endPress") {
      bool = false;
    }
    controls[this.player][this.control] = bool;

    return controls;
  }
}

module.exports = Action;
