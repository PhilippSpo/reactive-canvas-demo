// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
Shape = function(id, shapeCollection, canvasStateObj) {
  var shape = shapeCollection.findOne({
    _id: id
  });
  if (!shape) {
    return;
  }
  this.id = id;
  this.selected = false;
  this.closeEnough = 10;
  this.collection = shapeCollection;
  this.valid = true;
  this.opacity = 0.6;
  this.name = shape.name;
  var self = this;

  Tracker.autorun(function() {
    var shape = shapeCollection.findOne({
      _id: self.id
    });
    if (!shape) {
      // remove shape from canvas when it has been removed in the db
      var index = canvasStateObj.shapes.indexOf(self);
      if (index > -1) {
        canvasStateObj.shapes.splice(index, 1);
      }
      if(canvasStateObj.selection === self){
        canvasStateObj.selection = null;
      }
      // tell canvas to redraw
      canvasStateObj.valid = false;
      return;
    }
    var coords = shape.coords;
    // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    // But we aren't checking anything else! We could put "Lalala" for the value of x 
    self.x = coords.x || 0;
    self.y = coords.y || 0;
    self.w = coords.w || 1;
    self.h = coords.h || 1;
    var c = shape.color;
    self.color = c;
    self.fill = 'rgba('+c.r+','+c.g+','+c.b+','+self.opacity+')' || '#AAAAAA';
    // only set canvas to invalid and not the shape (so that the db doesnt get populated with the same change twice)
    canvasStateObj.valid = false;
  });
};
Shape.prototype.setOpacity = function(opacity){
  var c = this.color;
  if(!this.color){
    return;
  }
  this.fill = 'rgba('+c.r+','+c.g+','+c.b+','+opacity+')';
  this.opacity = opacity;
};

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {

  // set opacity according to selection
  if (this.selected === true) {
    this.setOpacity(0.9);
  }else{
    this.setOpacity(0.6);
  }

  // update collection if position/size was changed
  if (!this.valid) {
    this.collection.update({
      _id: this.id
    }, {
      $set: {
        coords: {
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h
        }
      }
    });
    this.valid = true;
  }

  // fill rect with color
  ctx.fillStyle = this.fill;
  // ctx.fillRect(this.x, this.y, this.w, this.h);
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x+this.w,this.y);
  ctx.lineTo(this.x+this.w, this.y+this.h);
  ctx.lineTo(this.x, this.y+this.h);
  ctx.closePath();
  ctx.fill();

  // black dashed border when selected
  if (this.selected === true) {
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
    
  // dashed border
  ctx.beginPath();
    ctx.setLineDash([5]);
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.lineWidth = 0.7;
  ctx.stroke();

  // draw resize handles when selected
  if (this.selected === true) {
    this.drawHandles(ctx);
  }

  // add text
  ctx.font = '15pt Helvetica Neue';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';
  ctx.fillText(this.name, this.x+(this.w/2), this.y+(this.h/2));
};

// Draw handles for resizing the Shape
Shape.prototype.drawHandles = function(ctx) {
  drawRectWithBorder(this.x, this.y, this.closeEnough, ctx);
  drawRectWithBorder(this.x + this.w, this.y, this.closeEnough, ctx);
  drawRectWithBorder(this.x + this.w, this.y + this.h, this.closeEnough, ctx);
  drawRectWithBorder(this.x, this.y + this.h, this.closeEnough, ctx);
};

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  if (this.touchedAtHandles(mx, my) === true) {
    return true;
  }
  var xBool = false;
  var yBool = false;
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  if (this.w >= 0) {
    xBool = (this.x <= mx) && (this.x + this.w >= mx);
  } else {
    xBool = (this.x >= mx) && (this.x + this.w <= mx);
  }
  if (this.h >= 0) {
    yBool = (this.y <= my) && (this.y + this.h >= my);
  } else {
    yBool = (this.y >= my) && (this.y + this.h <= my);
  }
  return (xBool && yBool);
};

// Determine if a point is inside the shape's handles
Shape.prototype.touchedAtHandles = function(mx, my) {
  // 1. top left handle
  if (checkCloseEnough(mx, this.x, this.closeEnough) && checkCloseEnough(my, this.y, this.closeEnough)) {
    return true;
  }
  // 2. top right handle
  else if (checkCloseEnough(mx, this.x + this.w, this.closeEnough) && checkCloseEnough(my, this.y, this.closeEnough)) {
    return true;
  }
  // 3. bottom left handle
  else if (checkCloseEnough(mx, this.x, this.closeEnough) && checkCloseEnough(my, this.y + this.h, this.closeEnough)) {
    return true;
  }
  // 4. bottom right handle
  else if (checkCloseEnough(mx, this.x + this.w, this.closeEnough) && checkCloseEnough(my, this.y + this.h, this.closeEnough)) {
    return true;
  }
};

// Draws a white rectangle with a black border around it
drawRectWithBorder = function(x, y, sideLength, ctx) {
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.fillRect(x - (sideLength / 2), y - (sideLength / 2), sideLength, sideLength);
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fillRect(x - ((sideLength - 1) / 2), y - ((sideLength - 1) / 2), sideLength - 1, sideLength - 1);
  ctx.restore();
};

// checks if two points are close enough to each other depending on the closeEnough param
function checkCloseEnough(p1, p2, closeEnough) {
  return Math.abs(p1 - p2) < closeEnough;
}