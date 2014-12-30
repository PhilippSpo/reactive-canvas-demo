Rectangles = new Mongo.Collection('rectangles');
Polygons = new Mongo.Collection('polygons');

if (Meteor.isServer) {
	Meteor.publish('rectangles', function(id) {
		if (id) {
			return Rectangles.find({
				$or: [{
					parentId: id
				}, {
					_id: id
				}]
			});
		} else {
			return Rectangles.find({
				parentId: {
					$exists: false
				}
			});
		}
	});
	Meteor.publish('polygons', function(id) {
		if (id) {
			return Polygons.find({
				$or: [{
					parentId: id
				}, {
					_id: id
				}]
			});
		} else {
			return Polygons.find({
				parentId: {
					$exists: false
				}
			});
		}
	});
	Meteor.methods({
		getShape: function(id) {
			var polygon = Polygons.findOne({
				_id: id
			});
			console.log(polygon);
			if (polygon) {
				return polygon;
			}
			var rectangle = Rectangles.findOne({
				_id: id
			});
			return rectangle;
		}
	});
}