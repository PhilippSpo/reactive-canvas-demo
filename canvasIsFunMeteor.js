if (Meteor.isClient) {
  Session.setDefault('shapeSelectedOnCanvas', false);
  Session.setDefault('coordSelectedOnCanvas', false);
  Session.setDefault('isCreatingElementOnCanvas', false);
  Session.setDefault('addPoints', false);

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
    'change .drawMode': function(e) {
      var val = $('input[name=drawMode]:checked').val();
      console.log(val);
      Template.hello.canvasState.insertMode = val;
    },
    'click #finishElement': function() {
      Template.hello.canvasState.finishElementCreation();
    },
    'click #deleteElement': function() {
      Template.hello.canvasState.selection.get().remove(true);
    },
    'click #addPoints': function() {
      Template.hello.canvasState.enableEditingMode();
    },
    'click #deleteCoord': function() {
      Template.hello.canvasState.selection.get().deleteSelectedCoord();
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

  Tracker.autorun(function() {
    var selection = Template.hello.canvasState.selection.get();
    if (selection !== null) {
      Session.set('shapeSelectedOnCanvas', true);
      if (selection instanceof Polygon) {
        Session.set('addPoints', true);
      } else {
        Session.set('addPoints', false);
      }
    } else {
      Session.set('shapeSelectedOnCanvas', false);
      Session.set('addPoints', false);
    }
  });
  Tracker.autorun(function() {
    var isCreating = Template.hello.canvasState.creatingElement.get();
    Session.set('isCreatingElementOnCanvas', isCreating);
  });
  Tracker.autorun(function() {
    var selection = Template.hello.canvasState.selection.get();
    if (selection !== null) {
      if (selection.selectedCoord.get() !== null) {
        Session.set('coordSelectedOnCanvas', true);
      } else {
        Session.set('coordSelectedOnCanvas', false);
      }
    } else {
      Session.set('coordSelectedOnCanvas', false);
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