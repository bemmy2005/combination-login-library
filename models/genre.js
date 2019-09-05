var mongoose =require ('mongoose');

var Schema=mongoose.Schema;

var GenreSchema = new Schema(
	{
		name:{type:String, required: true, min: 3, max: 100}
			//enum:['Fiction', 'Non-fiction', 'Romance','Military','History','Math', 'Geography', 'Computer'], defaul:'Romance'}
	});
// Virtual for this genre instance URL.
GenreSchema
.virtual('url')
.get(function () {
  return '/catalog/genre/'+this._id;
});

// Export model.
module.exports = mongoose.model('Genre', GenreSchema);