Router.route('/:shapeId?', {
	name: 'canvas',
	waitOn: function() {
		return [
			Meteor.subscribe('polygons', this.params.shapeId),
			Meteor.subscribe('rectangles', this.params.shapeId)
		];
	},
	action: function() {
		if (this.ready()) {
			this.layout('layout');
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