Router.route('/:shapeId?', {
	name: 'canvas',
	layoutTemplate: 'layout',
	waitOn: function() {
		return [
			Meteor.subscribe('polygons', this.params.shapeId),
			Meteor.subscribe('rectangles', this.params.shapeId)
		];
	},
	action: function() {
		if (this.ready()) {
			this.render('main');
		}
	},
	data: function() {
		Session.set('shapeId', this.params.shapeId);
		return {
			shapeId: this.params.shapeId
		};
	}
});