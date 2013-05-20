var canvas = document.getElementById('circular'),
    barCanvas = document.getElementById('bars'),
    ctx = canvas.getContext('2d'),
    barctx = barCanvas.getContext('2d'),
    channels,
    rate,
    frameBufferLength,
    fft,
    bandwidth;

var height = canvas.height;
var width = canvas.width;

var peaks = new Array();
var peakValue = 0;

var ALLOWANCE = .20;


var audio = document.getElementById('audio-element');
audio.addEventListener('MozAudioAvailable', audioAvailable, false);
audio.addEventListener('loadedmetadata', loadedMetadata, false);
audio.load();

function loadedMetadata() {
  channels          = audio.mozChannels;
  rate              = audio.mozSampleRate;
  frameBufferLength = audio.mozFrameBufferLength;
  bandwidth         = 2 / (frameBufferLength/channels) * rate / 2;
  fft = new FFT(frameBufferLength / channels, rate);
}

function changeAudio(name, type) {
    audio.setAttribute("type","audio/"+type);
    audio.setAttribute("src",name);
    audio.load();
    audio.play();
}

function promptName() {
    var form = document.getElementById("formsave");
    form.innerHTML += 'Artist: <input type="text" name="artist"></input>' +
	' Song Name: <input type="text" name="song"></input>' +
	'<input type="submit" value="Submit"></input>';
}

function normalizeTempo(tempo) {
  while (tempo < 80) {
    tempo = tempo *2;
  }
  while (tempo > 200) {
    tempo = tempo / 2;
  }

  return tempo.toFixed(2);
}


function audioAvailable(event) {
  var fb = event.frameBuffer;
  var t  = event.time;
  var signal = new Float32Array(fb.length / channels);
  var magnitude;

  for (var i = 0, fbl = frameBufferLength / 2; i < fbl; i++ ) {
    // Assuming interlaced stereo channels,
    // need to split and merge into a stero-mix mono signal
    signal[i] = (fb[2*i] + fb[2*i+1]) / 2;
  }

  fft.forward(signal);

  var bassAvg = 0;
  for(var i = 1; i<=4;i++) {
    bassAvg += fft.spectrum[i];
  }
  bassAvg /= 4;

  if (bassAvg <= peakValue*(1+ALLOWANCE) && bassAvg >= peakValue*(1-ALLOWANCE)) {
    peaks.push(t);
  } else if (bassAvg > peakValue*(1+ALLOWANCE)) {
    peaks.length = 0;
    peaks.push(t);
    peakValue = bassAvg;
  }

  var angle = (t/audio.duration)*(2*Math.PI) - (Math.PI / 2);

  var dB = 0;
  for (var i=0; i < fft.spectrum.length; i++) {
    dB += fft.spectrum[i];
  }
  dB = dB/fft.spectrum.length;

  var r = 30000*(dB);

  var gradient = ctx.createLinearGradient(width/2,height/2,width/2+r*Math.cos(angle),height/2+r*Math.sin(angle));
  //gradient.addColorStop(0,'#FFFFFF');

// bass
  var bass = 0;
  for(var i = 0; i < 5; i++) {
    bass += fft.spectrum[i];
  }
  bass = bass * 7;

// midrange
  var midrange = 0;
  for(var i = 5; i < 45; i++) {
    midrange += fft.spectrum[i];
  }
  midrange = midrange * 3;

//treble
  var treble = 0;
  for(var i = 45; i < 362; i++) {
    treble += fft.spectrum[i];
  }
  treble = treble;

  var totaldB = bass + midrange + treble;

  basspercent = bass / totaldB; 
  midrangepercent = midrange / totaldB;
  treblepercent = treble / totaldB;

  var colors = document.getElementsByClassName("color");

  var basscolor = "#" + colors[0].value;
  var midrangecolor = "#" + colors[1].value;
  var treblecolor = "#" + colors[2].value; 

  gradient.addColorStop(basspercent, basscolor);
  gradient.addColorStop(basspercent + midrangepercent, midrangecolor);
  gradient.addColorStop(basspercent + midrangepercent + treblepercent, treblecolor);

  ctx.lineWidth = .5;
  ctx.lineCap = 'round';

  ctx.strokeStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(width/2,height/2);
  ctx.lineTo(width / 2 + r * Math.cos(angle),height / 2 + r * Math.sin(angle));
  ctx.stroke();
 
  //bars  
  var barcolor = "#FF0000";
  if (basspercent > midrangepercent && basspercent > treblepercent) {
    barcolor = basscolor;
  }
  else if (midrangepercent > basspercent  && midrangepercent > treblepercent) {
    barcolor = midrangecolor;
  }
  else {
    barcolor = treblecolor;
  }

  barctx.clearRect(0,0,barCanvas.width,barCanvas.height);
  for (var i = 0; i < fft.spectrum.length; i++ ) {
      magnitude = fft.spectrum[i] * 4000;
      barctx.fillStyle = barcolor;
      barctx.fillRect(i * 4, canvas.height, 3, -magnitude);
  }


}

audio.onended = function() {
  


  /*
  var tempos = new Array();
  for(var i=0; i<peaks.length-1;i++) {
    tempos[i] = peaks[i+1] - peaks[i];
  }
  var min = 0.2;
  var tempoMap = {};
  for(var i = 0; i<tempos.length; i++) {
    if (tempos[i] > min) {
      var n = tempos[i].toFixed(3);
      if (tempoMap[n] == undefined) {
        tempoMap[n] = [tempos[i]];
      } else {
        tempoMap[n].push(tempos[i]);
      }
    }
  }

  var tempo;
  var occurences = 0;
  for (var t in tempoMap) {
    if (tempoMap[t].length > occurences) {
      occurences = tempoMap[t].length;
      tempo = t;
    }
  }

    */

    //delete the song
    document.getElementById("delete").value = audio.getAttribute("src");
    //    document.getElementById("formdelete").submit();

    document.getElementById("save").value = canvas.toDataURL('image/png');
    //    document.getElementById("formsave").submit();
    promptName();

  // var guesses = new Array();

  // for (var t in tempoMap) {
  //   if(tempoMap[t].length > 1) {
  //     for(var i=0; i<tempoMap[t].length-1; i++) {
  //       for(var j=i+1; j<tempoMap[t].length; j++) {
  //         tempo = tempoMap[t][j] - tempoMap[t][i];
  //         if(tempo < .1) continue;
  //         tempo = normalizeTempo(60/tempo);
  //         guesses.push(tempo);
  //       }
  //     }
  //   }
  // }

  // guesses.sort();


  tempo = normalizeTempo(60/tempo);
  console.log("tempo hypothesis is: "+tempo);

}

// FFT from dsp.js, see below
var FFT = function(bufferSize, sampleRate) {
  this.bufferSize   = bufferSize;
  this.sampleRate   = sampleRate;
  this.spectrum     = new Float32Array(bufferSize/2);
  this.real         = new Float32Array(bufferSize);
  this.imag         = new Float32Array(bufferSize);
  this.reverseTable = new Uint32Array(bufferSize);
  this.sinTable     = new Float32Array(bufferSize);
  this.cosTable     = new Float32Array(bufferSize);

  var limit = 1,
      bit = bufferSize >> 1;

  while ( limit < bufferSize ) {
    for ( var i = 0; i < limit; i++ ) {
      this.reverseTable[i + limit] = this.reverseTable[i] + bit;
    }

    limit = limit << 1;
    bit = bit >> 1;
  }

  for ( var i = 0; i < bufferSize; i++ ) {
    this.sinTable[i] = Math.sin(-Math.PI/i);
    this.cosTable[i] = Math.cos(-Math.PI/i);
  }
};

FFT.prototype.forward = function(buffer) {
  var bufferSize   = this.bufferSize,
      cosTable     = this.cosTable,
      sinTable     = this.sinTable,
      reverseTable = this.reverseTable,
      real         = this.real,
      imag         = this.imag,
      spectrum     = this.spectrum;

  if ( bufferSize !== buffer.length ) {
    throw "Supplied buffer is not the same size as defined FFT. FFT Size: " + bufferSize + " Buffer Size: " + buffer.length;
  }

  for ( var i = 0; i < bufferSize; i++ ) {
    real[i] = buffer[reverseTable[i]];
    imag[i] = 0;
  }

  var halfSize = 1,
      phaseShiftStepReal, 
      phaseShiftStepImag,
      currentPhaseShiftReal,
      currentPhaseShiftImag,
      off,
      tr,
      ti,
      tmpReal,  
      i;

  while ( halfSize < bufferSize ) {
    phaseShiftStepReal = cosTable[halfSize];
    phaseShiftStepImag = sinTable[halfSize];
    currentPhaseShiftReal = 1.0;
    currentPhaseShiftImag = 0.0;

    for ( var fftStep = 0; fftStep < halfSize; fftStep++ ) {
      i = fftStep;

      while ( i < bufferSize ) {
        off = i + halfSize;
        tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
        ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

        real[off] = real[i] - tr;
        imag[off] = imag[i] - ti;
        real[i] += tr;
        imag[i] += ti;

        i += halfSize << 1;
      }

      tmpReal = currentPhaseShiftReal;
      currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
      currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
    }

    halfSize = halfSize << 1;
  }

  i = bufferSize/2;
  while(i--) {
    spectrum[i] = 2 * Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / bufferSize;
  }


};
