var imageFiles = [];

$.ajax({
    url: "images/", 
    async: false,
    success: function(data) {
        $(data).find("a:contains(.png)").each(function() {
	    var image = $(this).attr("href");
	    imageFiles.push(image);
	});
    }
});


var bgimages = document.getElementsByClassName("bgimage");
var tags = document.getElementsByClassName("song/artist");

var randomImages = [];

for (var i = 0; i < bgimages.length; i++) {
    var randInt = Math.floor(Math.random() * imageFiles.length);
    randomImages.push(imageFiles[randInt]);
    imageFiles.splice(randInt, 1);
}


for (var i = 0; i < bgimages.length; i++) {   
    bgimages[i].setAttribute("src", "images/" + randomImages[i]);
    var title = randomImages[i].split(".png")[0].split("%20");
    var nameandartist = "";
    for (var j = 0; j < title.length; j++) {
	nameandartist += title[j] + " ";
    }
    tags[i].innerHTML = nameandartist;
}

