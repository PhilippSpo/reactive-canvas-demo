Template.main.created = function () {
  this.drawMode = new ReactiveVar('Polygon');
};

Template.main.rendered = function() {
  // if there is no shapeId then show all the shapes
  // if there is a shape id only the childs of the given shape will be displayed
  var shapeId = null;
  var tmplInst = this;
  init();
  initSlider();

  if (Router.current().params.shapeId) {
    initDetailView();
  }
};

function initSlider() {
  $('.slider').noUiSlider({
    start: 1,
    connect: "lower",
    range: {
      'min': 0,
      'max': 3
    },
    format: wNumb({
      decimals: 2
    })
  });
  $('.slider').on('slide', function(scale) {
    ReactiveCanvasStore.floorCanvas.setScale($('.slider').val());
  });
}

function initDetailView() {
  var shapeId = Router.current().params.shapeId;
  ReactiveCanvasStore.floorCanvas.setShapeForCropping(shapeId);
}

Template.main.events({
  'change .drawMode': function(e) {
    Template.instance().drawMode.set($(e.currentTarget).val());
  },
  'click #finishElement': function() {
    ReactiveCanvasStore.floorCanvas.finishElementCreation();
  },
  'click #deleteElement': function() {
    ReactiveCanvasStore.floorCanvas.selection.get().remove(true);
  },
  'click #addPoints': function() {
    ReactiveCanvasStore.floorCanvas.enableEditingMode();
  },
  'click #deleteCoord': function() {
    ReactiveCanvasStore.floorCanvas.selection.get().deleteSelectedCoord();
  },
  'click #showDetailView': function() {
    Router.go('canvas', {
      shapeId: ReactiveCanvasStore.floorCanvas.selection.get().id
    });
  },
  'change #editModeSwitch': function(event) {
    ReactiveCanvasStore.floorCanvas.editMode = event.target.checked;
  },
  'click #createElement': function() {
    ReactiveCanvasStore.floorCanvas.createShape(Template.instance().drawMode.get(), null, function() {
      var shapeId = Router.current().params.shapeId;
      if (shapeId) {
        return {
          parentId: shapeId
        };
      }
    });
  }
});

Template.main.helpers({
  selected: function() {
    return Session.get('shapeSelectedOnCanvas');
  },
  isCreating: function() {
    return Session.get('isEditingShapeOnCanvas');
  },
  showAddPoints: function() {
    return Session.get('addPoints');
  },
  coordSelected: function() {
    return Session.get('coordSelectedOnCanvas');
  },
  name: function() {
    if (!ReactiveCanvasStore.floorCanvas || ReactiveCanvasStore.floorCanvas.selection.get() === null) {
      return;
    }
    return ReactiveCanvasStore.floorCanvas.selection.get().id;
  },
  editModeActive: function() {
    if (ReactiveCanvasStore.floorCanvas) {
      return ReactiveCanvasStore.floorCanvas.editMode;
    }
    return false;
  }
});
// initialize the reactiveCanvas and the Rectangles
init = function() {
  if (typeof ReactiveCanvasStore.floorCanvas === 'undefined') {

    var shapesCfg = [{
      type: 'Rectangle',
      collection: Rectangles,
      extendOnCreation: function() {
        var shapeId = Router.current().params.shapeId;
        if (shapeId) {
          return {
            parentId: shapeId
          };
        }
      },
      clickedForDetail: function(shapeId) {
        Router.go('canvas', {
          shapeId: shapeId
        });
      }
    }, {
      type: 'Polygon',
      collection: Polygons,
      extendOnCreation: function() {
        var shapeId = Router.current().params.shapeId;
        if (shapeId) {
          return {
            parentId: shapeId
          };
        }
      },
      clickedForDetail: function(shapeId) {
        Router.go('canvas', {
          shapeId: shapeId
        });
      }
    }];

    ReactiveCanvasStore.floorCanvas = new ReactiveCanvas('floorCanvas', shapesCfg, '/cad.jpg');

  } else {
    ReactiveCanvasStore.floorCanvas.cleanup();
  }
};