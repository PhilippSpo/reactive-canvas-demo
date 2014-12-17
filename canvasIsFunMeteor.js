if (Meteor.isClient) {
  Meteor.subscribe('polygons');
  Meteor.subscribe('rectangles');

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
  Template.hello.reactiveCanvas = new ReactiveCanvas(document.getElementById('canvas1'), Rectangles, Polygons);
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