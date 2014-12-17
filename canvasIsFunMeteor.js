if (Meteor.isClient) {

  Template.hello.rendered = function() {
    Meteor.subscribe('polygons');
    Meteor.subscribe('rectangles', {
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
// initialize the canvasState and the Rectangles
init = function() {
  Template.hello.canvasState = new CanvasState(document.getElementById('canvas1'), Rectangles, Polygons);
  var s = Template.hello.canvasState;
  var shapes = Rectangles.find();
  var polygons = Polygons.find();

  // observe added and removed
  shapes.observeChanges({
    added: function(id) {
      s.addShape(new Rectangle(id, Rectangles, s));
    },
    removed: function(id) {
      // is handled automatically at the moment
      // if you want to have some code to handle the removing do it here
    }
  });
  polygons.observeChanges({
    added: function(id) {
      s.addShape(new Polygon(id, Polygons, s));
    },
    removed: function(id) {
      // is handled automatically at the moment
      // if you want to have some code to handle the removing do it here
    }
  });

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