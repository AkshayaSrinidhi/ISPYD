const sql = require("./db.js");

// constructor
const Annotation = function(annotation) {
  this.user_id = annotation.user_id;
  this.image_id = annotation.image_id;
  this.label = annotation.label;
  this.x = annotation.x;
  this.y = annotation.y;
  this.width = annotation.width;
  this.height = annotation.height;
};

Annotation.create = (newAnnotation, result) => {
    sql.query("INSERT INTO annotations SET ?", newAnnotation, (err, res) => {
      if (err) {
        console.log("error: ", err);
        //result(err, null);
        return;
      }
  
      console.log("created Annotation: ", { id: res.insertId, ...newAnnotation });
      //result(null, { id: res.insertId, ...newAnnotation });
    });
  };

  module.exports = Annotation;
  