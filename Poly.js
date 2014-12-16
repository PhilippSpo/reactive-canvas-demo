// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Polygon objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
Polygon = function(id, polyCollection, canvasStateObj) {
  var polygon = polyCollection.findOne({
    _id: id
  });
  if (!polygon) {
    return;
  }
  this.id = id;
  this.selected = false;
  this.closeEnough = 10;
  this.collection = polyCollection;
  this.valid = true;
  this.opacity = 0.6;
  this.name = polygon.name;
  this.canvasStateObj = canvasStateObj;

  var self = this;

  Tracker.autorun(function() {
    var polygon = polyCollection.findOne({
      _id: self.id
    });
    if (!polygon) {
      // remove polygon from canvas when it has been removed in the db
      var index = canvasStateObj.polygons.indexOf(self);
      if (index > -1) {
        canvasStateObj.polygons.splice(index, 1);
      }
      if (canvasStateObj.selection === self) {
        canvasStateObj.selection = null;
      }
      // tell canvas to redraw
      canvasStateObj.valid = false;
      return;
    }
    var coords = polygon.coords;
    // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    // But we aren't checking anything else! We could put "Lalala" for the value of x 
    self.coords = coords;
    var c = polygon.color;
    self.color = c;
    self.fill = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + self.opacity + ')' || '#AAAAAA';
    // only set canvas to invalid and not the polygon (so that the db doesnt get populated with the same change twice)
    canvasStateObj.valid = false;
  });
};
Polygon.prototype.setOpacity = function(opacity) {
  var c = this.color;
  if (!this.color) {
    return;
  }
  this.fill = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + opacity + ')';
  this.opacity = opacity;
};

// Draws this polygon to a given context
Polygon.prototype.draw = function(ctx) {

  // set opacity according to selection
  if (this.selected === true) {
    this.setOpacity(0.9);
  } else {
    this.setOpacity(0.6);
  }

  if (!this.valid) {
    this.collection.update({
      _id: this.id
    }, {
      $set: {
        coords: this.coords
      }
    });
  }

  // fill rect with color
  ctx.fillStyle = this.fill;
  ctx.beginPath();
  var first = true;
  // iterate all points
  for (var i in this.coords) {
    var point = this.coords[i];
    if (first) {
      ctx.moveTo(point.x, point.y);
      first = false;
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
  ctx.fill();

  // black dashed border when selected
  if (this.selected === true) {
    ctx.lineWidth = 1;
    // ctx.strokeRect(this.x, this.y, this.w, this.h);
  }

  // dashed border
  ctx.beginPath();
  ctx.setLineDash([5]);
  for (var j in this.coords) {
    var point = this.coords[j];
    if (first) {
      ctx.moveTo(point.x, point.y);
      first = false;
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
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
  // ctx.fillText(this.name, this.x + (this.w / 2), this.y + (this.h / 2));
};

// Draw handles for resizing the Polygon
Polygon.prototype.drawHandles = function(ctx) {
  for (var i in this.coords) {
    var point = this.coords[i];
    drawRectWithBorder(point.x, point.y, this.closeEnough, ctx);
  }
};

// Determine if a point is inside the polygon's bounds
Polygon.prototype.contains = function(mx, my) {
  if (this.touchedAtHandles(mx, my) === true) {
    return true;
  }
  var p = {
    x: mx,
    y: my
  };
  var isOdd = false;
  var j = (this.coords.length - 1);
  for (var i = 0; i < this.coords.length; i++) {
    if ((this.coords[i].y < p.y && this.coords[j].y >= p.y) ||
      (this.coords[j].y < p.y && this.coords[i].y >= p.y)) {
      if (this.coords[i].x + (p.y - this.coords[i].y) / (this.coords[j].y -
          this.coords[i].y) * (this.coords[j].x - this.coords[i].x) < p.x) {
        isOdd = (!isOdd);
      }
    }
    j = i;
  }
  return isOdd;
};

// Determine if a point is inside the polygon's handles
Polygon.prototype.touchedAtHandles = function(mx, my) {
  // check all coord points
  if (this.touchedAtHandlesReturnPoint(mx, my)) {
    return true;
  }
};

Polygon.prototype.touchedAtHandlesReturnPoint = function(mx, my) {
  // check all coord points
  for (var i in this.coords) {
    var point = this.coords[i];
    if (checkCloseEnough(mx, point.x, this.closeEnough) && checkCloseEnough(my, point.y, this.closeEnough)) {
      return point;
    }
  }
};

Polygon.prototype.mouseDown = function(e, mouse) {
  console.log('mouseDown');
  this.selectedPoint = this.touchedAtHandlesReturnPoint(mouse.x, mouse.y);
  for (var i in this.coords) {
    var point = this.coords[i];
    if (point === this.selectedPoint) {
      this.selectedIndex = i;
    }
  }
};

Polygon.prototype.mouseMove = function(e, mouse) {

  var newPoint = {
    x: mouse.x,
    y: mouse.y
  };
  this.coords[this.selectedIndex] = newPoint;
  this.selectedPoint = newPoint;
  // set to false, so the draw method updates the database and draws the change
  this.valid = false;
  // redraw canvas -> poly gets redrawn autom.
  this.canvasStateObj.valid = false;
  
};

// Polygon.prototype.addPoint = function(x, y) {
//   console.log('add point', x, y);
//   var newPoint = {x: x, y: y};
//   this.coords.push(newPoint);
//   // invalidate to redraw
//   this.valid = false;
//   // store change to db
//   this.collection.update({
//     _id: this.id
//   }, {
//     $push: {
//       coords: newPoint
//     }
//   });
// };

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

addPointToPolyDoc = function(event, canvasStateObj, polygonId, polyCollection) {
  var mouse = canvasStateObj.getMouse(event);
  var newPoint = {
    x: mouse.x,
    y: mouse.y
  };
  // just update the database, since the existing element will redraw itself with the update from the database
  polyCollection.update({
    _id: polygonId
  }, {
    $push: {
      coords: newPoint
    }
  });
};