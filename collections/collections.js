Rectangles = new Mongo.Collection('rectangles');
Polygons = new Mongo.Collection('polygons');
Icons = new Mongo.Collection('icons');

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
	Meteor.publish('icons', function(id) {
		if (id) {
			return Icons.find({
				$or: [{
					parentId: id
				}, {
					_id: id
				}]
			});
		} else {
			return Icons.find({
				parentId: {
					$exists: false
				}
			});
		}
	});
}