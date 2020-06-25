function getPosSize(options) {
  var x, y, w, h, size;

  // Multiply the dimensions by the ratio of the current screen size to the base screen size
  // Rectangles have a width and height, circles just have one size (radius, stored as width)
  if (options.type == 'rect') {
    w = options.w * ratio;
    h = options.h * ratio;
  } else if (options.type == 'circle') {
    w = options.w * ratio;
    h = w;
  }

  // Multiply the text size by the ratio as well
  if (options.textSize !== undefined) size = options.textSize * ratio;

  // Calculate the position of the shape

  // If the position is greater than 1, it is an absolute pixel value
  // If it is less than 1, it is a proportion of the screen

  // If the position is negative, it is from the right/bottom rather than the left/top

  if (Math.abs(options.x) > 1) {
    if (options.x >= 0) {
      x = options.x * ratio;
    } else {
      x = width + options.x * ratio;
    }
  } else {
    if (options.x >= 0) {
      x = width * options.x;
    } else {
      x = width + (width * options.x);
    }
  }

  if (Math.abs(options.y) > 1) {
    if (options.y >= 0) {
      y = options.y * ratio;
    } else {
      y = height + options.y * ratio;
    }
  } else {
    if (options.y >= 0) {
      y = height * options.y;
    } else {
      y = height + (height * options.y);
    }
  }

  // If xEdge or yEdge are true, offset the position
  // Makes the edge of the shape at that position (instead of the centre)

  if (options.xEdge && (options.type == 'rect' || options.type == 'circle')) {
    if (options.x >= 0) {
      x += w / 2;
    } else {
      x -= w / 2;
    }
  }

  if (options.yEdge && (options.type == 'rect' || options.type == 'circle')) {
    if (options.y >= 0) {
      y += h / 2;
    } else {
      y -= h / 2;
    }
  }

  return { x, y, w, h, size }
}

function drawText(txt, options, colour) {
  var { x, y, size } = getPosSize(options);

  push();
  translate(x, y);

  var c = colour || 255;
  noStroke();
  fill(c);
  if (!options.xEdge) {
    textAlign(CENTER);
  }

  textSize(size);

  text(txt, 0, size / 3);

  pop();
}

function drawCircle(options) {
  options.type = 'circle';
  var { x, y, w } = getPosSize(options);

  push();
  translate(x, y);

  ellipse(0, 0, w * 2);

  pop();
}

function drawRect(options) {
  options.type = 'rect';
  var { x, y, w, h } = getPosSize(options);

  push();
  translate(x, y);

  rect(0, 0, w, h);

  pop();
}

var backButtonOptions = {
    x: -25,
    y: 25,
    textSize: 18,
    xEdge: true,
    yEdge: true,
    w: 90,
    h: 30,
  };
