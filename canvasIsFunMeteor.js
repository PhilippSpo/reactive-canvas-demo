if (Meteor.isClient) {
  Meteor.subscribe('polygons');
  Meteor.subscribe('rectangles');

  Session.setDefault('entityId', '1ngq03g48unc2fx');

  Template.hello.rendered = function() {
    init();
  };

  Template.hello.events({
    'change .drawMode': function(e) {
      var val = $('input[name=drawMode]:checked').val();
      Template.hello.reactiveCanvas.insertMode = val;
    },
    'click #finishElement': function() {
      Template.hello.reactiveCanvas.finishElementCreation();
    },
    'click #deleteElement': function() {
      Template.hello.reactiveCanvas.selection.get().remove(true);
    },
    'click #addPoints': function() {
      Template.hello.reactiveCanvas.enableEditingMode();
    },
    'click #deleteCoord': function() {
      Template.hello.reactiveCanvas.selection.get().deleteSelectedCoord();
    }
  });

  Template.hello.helpers({
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
}
// initialize the reactiveCanvas and the Rectangles
init = function() {
  var canvas = document.getElementById('canvas1');
  Template.hello.reactiveCanvas = new ReactiveCanvas(canvas, Rectangles, Polygons);
  Template.hello.reactiveCanvas.extendPolygon = Template.hello.reactiveCanvas.extendRectangle = function() {
    return {
      entityId: Session.get('entityId')
    };
  };



  Template.hello.reactiveCanvas.img = new Image();
  Template.hello.reactiveCanvas.img.src = 'cad.jpg';
  Template.hello.reactiveCanvas.img.onload = function() {

    interval = 30;
    setInterval(function() {
      draw();
    }, interval);
    Template.hello.reactiveCanvas.redrawParent = draw;
  };
};

scaleFactor = 1.0;

draw = function() {

  var canvas = document.getElementById('canvas1');
  var context = canvas.getContext('2d');

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.restore();

  context.save();
  context.scale(scaleFactor, scaleFactor);
  context.drawImage(Template.hello.reactiveCanvas.img, 0, 0); //, $image.width(), $image.height(), 0, 0, $image.width(), $image.height());
  //redraw children

  Template.hello.reactiveCanvas.redrawAsChild = true;
  Template.hello.reactiveCanvas.draw();
  context.restore();
};

Rectangles = new Mongo.Collection('rectangles');
Polygons = new Mongo.Collection('polygons');

if (Meteor.isServer) {
  Meteor.publish('rectangles', function() {
    return Rectangles.find();
  });
  Meteor.publish('polygons', function() {
    return Polygons.find();
  });
}