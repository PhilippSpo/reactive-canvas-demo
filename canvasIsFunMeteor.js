if (Meteor.isClient) {

  Template.hello.rendered = function() {
    Meteor.subscribe('shapes', {
      onReady: function() {
        init();

      },
      onError: function(error) {
        console.log(error);
      }
    });
  };
}
// initialize the canvasState and the Shapes
init = function() {
  var s = new CanvasState(document.getElementById('canvas1'), Shapes);
  var shapes = Shapes.find();
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
};

Shapes = new Mongo.Collection('shapes');

if (Meteor.isServer) {
  Meteor.publish('shapes', function() {
    return Shapes.find();
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