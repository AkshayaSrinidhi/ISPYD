

$(document).on('turbolinks:load',
function(){
  attachListeners();
  $('#js-prev').attr("data-id") = 10; //setter
  $('#js-next').attr("data-id") = 10 //setter

})

$(document).on('turbolinks:load', function(){
    attachListeners()
  })
  const attachListeners = () => {
    $(".js-next").click((e) => getNextPhoto(e));
    $(".js-prev").click((e) => getPreviousImage(e));
  }

  const getPreviousImage = e => {
    e.preventDefault();
    let previousID = parseInt($(".js-previous").attr("data-id")) - 1;
    $.get('./images/part2/Image${previousId}.JPEG', function(imageData){
       createNextOrPreviousImage(imageData);
     });
     
  }
  const getNextImage = e => {
    e.preventDefault();
    let nextID = parseInt($(".js-next").attr("data-id")) + 1;
    $.get('./images/part2/Image${nextId}.JPEG', function(imageData){
       createNextOrPreviousImage(imageData);
     });
  }
  const createNextOrPrevousImage = imageData => {
    let Image = new Image(imageData);
    image.displayImage;
  }
  class Image{
    constructor(imageData){
      this.id = image.id;
      this.url = image.url;
     }
     displayImage(){
       $(".display_image").attr("src", this.url);
       $(".js-prev").attr("data-id", this.id);
       $(".js-next").attr("data-id", this.id);
     }
    }