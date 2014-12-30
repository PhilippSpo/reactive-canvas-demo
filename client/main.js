Template.main.rendered = function() {
  // if there is no shapeId then show all the shapes
  // if there is a shape id only the childs of the given shape will be displayed
  var shapeId = this.data.shapeId;
  init();
  if (shapeId) {
    initDetailView();
  }
};

function initDetailView() {
  Tracker.autorun(function() {
    var canvas = document.getElementById('canvas1');
    var context = canvas.getContext('2d');
    var shape = Template.main.reactiveCanvas.getShapeForId(Template.instance().data.shapeId);
    shape.visible = false;
    var dbDoc = shape.collection.findOne({
      _id: shape.id
    });
    // draw order is very important here
    // 1. transform canvas
    var dimensions = CanvasFunctions.translateContextToFitShape(canvas, shape, Template.main.reactiveCanvas);
    // tell the reactiveCanvas about the translation
    Template.main.reactiveCanvas.translation = {
      x: -dimensions.origin.x,
      y: -dimensions.origin.y
    };

    /*
     * save() allows us to save the canvas context before
     * defining the clipping region so that we can return
     * to the default state later on
     */
    context.save();
    // 2. clip shapw shape (so that the image gets drawn inside)
    CanvasFunctions.clipShapeOnCanvas(canvas, shape);
    // 3. draw image (to be in the background)
    context.drawImage(Template.main.reactiveCanvas.img, 0, 0);
    /*
     * restore() restores the canvas context to its original state
     * before we defined the clipping region
     */

  });
}

function clearCanvas(context) {
  context.restore();
  // clear canvas
  // Store the current transformation matrix
  context.save();
  // Use the identity matrix while clearing the canvas
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Restore the transform
  context.restore();
}

Template.main.events({
  'change .drawMode': function(e) {
    var val = $('input[name=drawMode]:checked').val();
    Template.main.reactiveCanvas.insertMode = val;
  },
  'click #finishElement': function() {
    Template.main.reactiveCanvas.finishElementCreation();
  },
  'click #deleteElement': function() {
    Template.main.reactiveCanvas.selection.get().remove(true);
  },
  'click #addPoints': function() {
    Template.main.reactiveCanvas.enableEditingMode();
  },
  'click #deleteCoord': function() {
    Template.main.reactiveCanvas.selection.get().deleteSelectedCoord();
  }
});

Template.main.helpers({
  selected: function() {
    return Session.get('shapeSelectedOnCanvas');
  },
  isCreating: function() {
    return Session.get('isCreatingElementOnCanvas');
  },
  showAddPoints: function() {
    return Session.get('addPoints');
  },
  coordSelected: function() {
    return Session.get('coordSelectedOnCanvas');
  }
});
// initialize the reactiveCanvas and the Rectangles
init = function() {
  if (typeof Template.main.reactiveCanvas === 'undefined') {
    console.log('init');
    var canvas = document.getElementById('canvas1');
    Template.main.reactiveCanvas = new ReactiveCanvas(canvas, Rectangles, Polygons);

    var context = canvas.getContext('2d');
    Template.main.reactiveCanvas.scaleFactor = 1.0;

    Template.main.reactiveCanvas.img = new Image();
    Template.main.reactiveCanvas.img.src = 'cad.jpg';
    Template.main.reactiveCanvas.img.onload = function() {

      interval = 5000;
      setInterval(function() {
        draw();
      }, interval);
      Template.main.reactiveCanvas.redrawParent = draw;
    };

    var shapeId = Template.instance().data.shapeId;
    if (shapeId) {
      Template.main.reactiveCanvas.extendPolygon = Template.main.reactiveCanvas.extendRectangle = function() {
        return {
          parentId: shapeId
        };
      };
    }
  }
};

draw = function() {

  var canvas = document.getElementById('canvas1');
  var context = canvas.getContext('2d');

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.restore();

  context.save();
  context.scale(Template.main.reactiveCanvas.scaleFactor, Template.main.reactiveCanvas.scaleFactor);
  context.drawImage(Template.main.reactiveCanvas.img, 0, 0); //, $image.width(), $image.height(), 0, 0, $image.width(), $image.height());
  //redraw children

  Template.main.reactiveCanvas.draw(true);
  context.restore();
};