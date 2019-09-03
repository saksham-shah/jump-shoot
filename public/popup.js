function popupMessage(message, size) {
  popup = new Popup(message, size);
}

class Popup {
    constructor(message, size) {
        this.message = message;
        this.size = size || 30;

        this.closeButton = new Button(50, 50, "", () => {
          popup = null;
        });
    }

    show() {
        push();
        fill(0, 200);
        noStroke();
        rect(width / 2, height / 2, width, height);

        textSize(this.size);
        textAlign(CENTER, CENTER);
        fill(255);

        this.closeButton.updateState(width - 50, 50);
        this.closeButton.show(width - 50, 50);

        // rectMode(CORNER);
        text(this.message, width / 2, height / 2);//, width, height);



        textTarget = null;

        pop();
    }
}
