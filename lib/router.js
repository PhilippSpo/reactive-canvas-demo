Router.route('/:shapeId?', {
	waitOn: function() {
		return [
			Meteor.subscribe('polygons', this.params.shapeId),
			Meteor.subscribe('rectangles', this.params.shapeId)
		];
	},
	action: function() {
		this.layout('layout');
		this.render('main');
	},
	data: function(){
		return {
			shapeId: this.params.shapeId
		};
	}
});