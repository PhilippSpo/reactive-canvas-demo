if (Meteor.isClient) {

  Template.hello.rendered = function() {
    Meteor.subscribe('polygons');
    Meteor.subscribe('shapes', {
      onReady: function() {
        init();

      },
      onError: function(error) {
        console.log(error);
      }
    });
  };

  Template.hello.events({
    'change .drawMode': function (e) {
      var val = $('input[name=drawMode]:checked').val();
      console.log(val);
      Template.hello.canvasState.insertMode = val;
    },
    'click #finishElement': function () {
      Template.hello.canvasState.creatingElement = false;
    }
  });
}
// initialize the canvasState and the Shapes
init = function() {
  Template.hello.canvasState = new CanvasState(document.getElementById('canvas1'), Shapes, Polygons);
  var s = Template.hello.canvasState;
  var shapes = Shapes.find();
  var polygons = Polygons.find();
  s.shapes = [];
  
  // observe added and removed
  shapes.observeChanges({
    added: function(id) {
      s.addShape(new Shape(id, Shapes, s));
    },
    removed: function(id) {
      // ...
    }
  });
  polygons.observeChanges({
    added: function(id) {
      s.addShape(new Polygon(id, Polygons, s));
    },
    removed: function(id) {
      // ...
    }
  });
  
};

Shapes = new Mongo.Collection('shapes');
Polygons = new Mongo.Collection('polygons');

if (Meteor.isServer) {
  Meteor.publish('shapes', function() {
    return Shapes.find();
  });
  Meteor.publish('polygons', function() {
    return Polygons.find();
  });
  // if (Shapes.find().fetch().length === 0) {
  //   var r = Math.floor(Math.random() * 255);
  //   var g = Math.floor(Math.random() * 255);
  //   var b = Math.floor(Math.random() * 255);
  //   Shapes.insert({
  //     name: 'shape1',
  //     x: 100,
  //     y: 100,
  //     w: 100,
  //     h: 100,
  //     color: 'rgba(' + r + ',' + g + ',' + b + ',.6)'
  //   });
  // }
}