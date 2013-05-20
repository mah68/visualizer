<!DOCTYPE html>
<html>
  <head>
    <title>Visualizer</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body> 
    <div style = "float:left" id = "leftpastvis">
        <center>
	<img src = "" class = "bgimage" width = 200 height = 200 alt = "no image there"></img>
	<br> 
	<span class = "song/artist"></span>
	<br> 
	<img src = "" class = "bgimage" width = 200 height = 200 alt = "no image there"></img>
	<br> 
	<span class = "song/artist"></span>
	<br>
	<img src = "" class = "bgimage" width = 200 height = 200 alt = "no image there"></img>
	<br> 
	<span class = "song/artist"></span>
	</center>
    </div> 
    <div style = "float:right" id = "rightpastvis">    
	<center>
	<img src = "" class = "bgimage" width = 200 height = 200 alt = "no image there"></img>
	<br> 
	<span class = "song/artist"></span>
	<br> 
	<img src = "" class = "bgimage" width = 200 height = 200 alt = "no image there"></img>
	<br> 
	<span class = "song/artist"></span>
	<br> 
	<img src = "" class = "bgimage" width = 200 height = 200 alt = "no image there"></img>
	<br> 
	<span class = "song/artist"></span>
	</center>
    </div> 
    <div style= "float:center" id="container">
      <div id="toptext">Visualizer v4.2.0</div>
      <audio id = "audio-element"
             src = ""
             autoplay = "true"
             controls = "false"
             type = "audio/ogg">
      </audio>
    <div id = "upload">
    <form action="index.php" method="post" enctype="multipart/form-data">
      <label for="file">Upload File&#58;</label>
      <input type="file" name="file" id="file">
      <input type="submit" name="submit" value="Play">
    </form>

    <form id = "formsave" action="/" method="post">
      <input type="hidden" name="delete" id="delete" >
      <input type="hidden" name="save" id="save" >
    </form>
    </div>
    <div align = "center" id = "colorcontrol">
      <table> 
      <tr> <td>BASS COLOR</td> 
           <td>MIDRANGE COLOR</td> 
           <td>TREBLE COLOR</td> 
      </tr> 
      <tr> <td> <input class = "color" value = "FF0000"> </td> 
           <td> <input class = "color" value = "00FF00"> </td> 
           <td> <input class = "color" value = "0000FF"> </td>
      </tr> 
      </table>
    </div>
    <div id="canvases">
        <canvas id="bars" height="500px" width="500px"></canvas>
        <canvas id="circular" height="500px" width="500px"></canvas>
    </div>
    </div>
    <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
    <script src="analyze.js"></script>
    <script src="jscolor/jscolor.js"></script>
    <script src="imageDisplay.js"></script>

<?php

// delete song


if(isset($_POST["delete"])) {
  $path = $_POST["delete"];
  unlink($path);
}

if(isset($_POST["save"])) {
  $img = $_POST["save"];
  $img = str_replace('data:image/png;base64,', '', $img);
  $img = str_replace(' ', '+', $img);
  $data = base64_decode($img);
  $file = "images/".$_POST["song"]." ~ ".$_POST["artist"].".png";
  file_put_contents($file, $data);
}

$allowedExts = array("wav","ogg");
$extension = end(explode(".", $_FILES["file"]["name"]));
if (in_array($extension, $allowedExts))
  {
    if ($_FILES["file"]["error"] > 0)
      {
	echo '<script type="text/javascript">window.alert(' .
	  '"Error reading file. Error: ' . $_FILES["file"]["error"] . '");</script>';
      }
  else
    {
      move_uploaded_file($_FILES["file"]["tmp_name"],
			   "upload/" . $_FILES["file"]["name"]);
      echo '<script type="text/javascript">changeAudio("upload/' . $_FILES["file"]["name"] .
	'","' . $extension . '");</script>';
    }
  }
else if ($_FILES["file"]["name"] != null)
  {
	echo '<script type="text/javascript">window.alert(' .
	  '"Invalid file type. Please use a wav or ogg audio file.");</script>';
  }



?>
  </body>
</html>
