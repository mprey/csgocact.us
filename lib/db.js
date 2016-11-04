module.exports = function(mongoose) {
  mongoose.connect(process.env.MONGODB_URI, function(err) {
    if (err) {
      console.log('Erorr while connecting to mongo database: ' + err.message);
    } else {
      console.log('Connected to MongoDB successfully.');
    }
  });
}
