
let onLoad = false;
let container;

let classifier;
// let video;
let stream;
let pitch = [];
let noteArr = [];
let pattern = [];
let thingsArr = [];
let yoloLoaded = false;
let yolo;
let resultArray1 = [];
let started = false;
let closenessArr = [];
let LoadedNotes;

let notes;

let generated_length = 1000;
let noteDuration = 150;
let input_text;
let LoadedNotesSplit;
var synth;

let markovLength = 4;
let tempo = 90;


const fileUrl = '/notes.txt' // provide file location


$.ajax({
  url: "/GetGridSize",
  context: document.body
}).done(function(data) {

});

//on page load finish do the next things:

window.onload = function() {
  onLoad = true;
  console.log('hello from script');
  init();
};


function convertRange( value, r1, r2 ) {
  return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}


function init(){
  console.log('hi');
  // updateMarkov(10, 4);


}



  function sliderChange1(val) {
      document.getElementById('output1').innerHTML = val;
      markovLength =  parseInt(val);

  }

  document.getElementById('slider1').value = 50;


  function sliderChange2(val) {
      document.getElementById('output2').innerHTML = val;
      generated_length = parseInt(val);
  }

  document.getElementById('slider2').value = 50;



function generateChain(){
  console.log('click');
  updateMarkov(generated_length , markovLength);
}

function updateMarkov(generated_length, markovLength){
  Tone.Transport.stop();

  console.log("here");
  fetch(fileUrl)
  .then( r => r.text() )
  .then( t => {
    LoadedNotes = t;
    LoadedNotesSplit = LoadedNotes.split(' ');
    // console.log("Notes", LoadedNotes);
    // console.log("Notes split", LoadedNotesSplit);
  }).then(
    function() {
      rm = new RiMarkov(markovLength);
      // if loading notes
      rm.loadTokens(LoadedNotesSplit);
      // rm.print();
      notes = rm.generateTokens(generated_length);
      console.log(notes);
      for (var i = 0; i < notes.length; i++) {
        let realnote = Tone.Frequency(notes[i], "midi").toNote(); //"A4"
        pattern.push(realnote);
      }
      // console.log('here',pattern )

    }).then(
      function() {
        synth = createSynthWithEffects();
        Tone.Transport.bpm.value = tempo;
        Tone.Transport.start();

        var seq = new Tone.Sequence(playNote, pattern, "8n");
        seq.start();
      }
    )
    .catch(error => console.error('Error:', error));
  }







  function createSynthWithEffects()  {
    let vol = new Tone.Volume(-40).toMaster();
    let reverb = new Tone.Freeverb(0.2).connect(vol);
    reverb.wet.value = 0.1;

    let delay = new Tone.FeedbackDelay(0.304, 0.1).connect(reverb);
    delay.wet.value = 0.1;

    let vibrato = new Tone.Vibrato(5, 0.2).connect(delay);

    let polySynth = new Tone.PolySynth(3, Tone.Synth, {
      "oscillator": {
        "type": "sine"
      },
      "envelope": {
        "attack": 0.3,
        "decay": 0.9,
        "sustain": 0.6,
        "release": 7,
      }
    });
    return polySynth.connect(vibrato);
  }

  function playNote(time, note) {
    if (note != "") {
      synth.triggerAttackRelease(note, "16n");
    }
  }
