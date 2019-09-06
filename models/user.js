var mongoose =require ('mongoose');

var Schema=mongoose.Schema;

var UserSchema = new Schema(
	{
		username:{type:String, required: true, min: 3, max: 100},
    password:{type:String, required: true, min: 3, max: 100},
		userrole:{type:String, required: true, min: 3, max: 100}
			//enum:['Fiction', 'Non-fiction', 'Romance','Military','History','Math', 'Geography', 'Computer'], defaul:'Romance'}
	});
// Virtual for this genre instance URL.
UserSchema
.virtual('url')
.get(function () {
  return '/catalog/user/'+this._id;
});

// Export model.
module.exports = mongoose.model('User', UserSchema);
