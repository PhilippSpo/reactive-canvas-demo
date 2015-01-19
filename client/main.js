Template.main.rendered = function() {
  // if there is no shapeId then show all the shapes
  // if there is a shape id only the childs of the given shape will be displayed
  var shapeId = null;
  var tmplInst = this;
  init();
  this.autorun(function() {

    if (shapeId !== Session.get('shapeId')) {
      // delete Template.main.reactiveCanvas;
      shapeId = Session.get('shapeId');
      Template.main.reactiveCanvas.cleanup();

      initSlider();
    }
    if (shapeId) {
      initDetailView(tmplInst);
      Template.main.reactiveCanvas.extendPolygon = Template.main.reactiveCanvas.extendRectangle = function() {
        return {
          parentId: shapeId
        };
      };
    } else {
      Template.main.reactiveCanvas.extendPolygon = Template.main.reactiveCanvas.extendRectangle = function() {};
    }
  });
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
    Template.main.reactiveCanvas.setScale($('.slider').val());
  });
}

function initDetailView(tmplInst) {
  var canvas = document.getElementById('canvas1');
  var context = canvas.getContext('2d');
  Tracker.autorun(function() {
    Template.main.reactiveCanvas.setShapeForCropping(tmplInst.data.shapeId);

    Template.main.reactiveCanvas.valid = false;

  });
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
  },
  'click #showDetailView': function() {
    Router.go('canvas', {
      shapeId: Template.main.reactiveCanvas.selection.get().id
    });
  },
  'change #editModeSwitch': function (event) {
    Template.main.reactiveCanvas.editMode = event.target.checked;
  },
  'click #createElement': function() {
    Template.main.reactiveCanvas.createElementAtOrigin();
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
  },
  name: function() {
    if (!Template.main.reactiveCanvas || Template.main.reactiveCanvas.selection.get() === null) {
      return;
    }
    return Template.main.reactiveCanvas.selection.get().id;
  },
  editModeActive: function() {
    if(Template.main.reactiveCanvas){
      return Template.main.reactiveCanvas.editMode;
    }
    return false;
  }
});
// initialize the reactiveCanvas and the Rectangles
init = function() {
  if (typeof Template.main.reactiveCanvas === 'undefined') {
    var canvas = document.getElementById('canvas1');
    Template.main.reactiveCanvas = new ReactiveCanvas('canvas1', Rectangles, Polygons, '/cad.jpg');
    Template.main.reactiveCanvas.shapeClickedForDetail = function(shapeId) {
      Router.go('canvas', {
        shapeId: shapeId
      });
    };

    var context = canvas.getContext('2d');
    Template.main.reactiveCanvas.scaleFactor = 1.0;

    interval = 5000;
    setInterval(function() {
      draw();
    }, interval);
    Template.main.reactiveCanvas.redrawParent = draw;
  }
};

draw = function() {

  var canvas = document.getElementById('canvas1');
  if (!canvas) {
    Template.main.reactiveCanvas.valid = false;
    return;
  }
  Template.main.reactiveCanvas.draw(true);
};