function addCheckLetter(box, word, layer) {
    box.on('mousedown', function() {
        checkLetter(box, word, layer);
        box.transitionTo({
            opacity: 0.2,
            duration: 0.5,
            easing: 'ease-out',
        });
    });
}

function showLetter(placeholder, letter) {
    placeholder.transitionTo({
        opacity: 0,
        duration: 0.3,
        easing: 'ease-out',
        callback: function () {
            placeholder.setText(letter);
            placeholder.transitionTo({
                opacity: 1,
                duration: 0.3,
                easing: 'ease-out'
            });
        }
    });
}

function checkLetter(box, word, layer) {
    for (var i in word) {
        if (box.getText() == word[i]) {
            box.setTextFill('blue');
            var shapes = layer.get('.letter' + word[i])

            for (var j in shapes) {
                showLetter(shapes[j], word[i]);
            }

            return;
        }

        box.setTextFill('red'); 
    }
}

function getWord(category) {
    var words = null;

    // This is needed in order to store
    // $.getJSON() output in a variable.
    $.ajaxSetup({
        async: false
    });

    // WARNING: the following uses XMLHttpRequest,
    // and MAY NOT work from local file access!!
    $.getJSON('data/wordlist.json', function(data) {
        words = data[category];
    });

    return words[parseInt(Math.random() * words.length)];
}

$(document).ready(function() {
    var stage = new Kinetic.Stage({
        container: 'container',
        width: 800,
        height: 600
    });

    var padLayer = new Kinetic.Layer(),
        wordLayer = new Kinetic.Layer(),
        wordToGuess = getWord('fruits'),
        abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (var i in wordToGuess) {
        var letter = new Kinetic.Text({
            name: 'letter' + wordToGuess[i],
            x: 55 + 90 * i,
            y: stage.getHeight() / 4,
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            width: 80,
            height: 90,
            padding: 20,
            offset: {
                x: 40,
                y: 45 
            },
            cornerRadius: 10,
            align: 'center',
            text: '?',
            fontSize: 40,
            fontFamily: 'Verdana',
            fontStyle: 'bold',
            textFill: 'black',
        });

        wordLayer.add(letter);
    }

    for (var i in abc) {
        var alphA = new Kinetic.Text({
            x: 15 + 60 * (i % 13),
            y: stage.getHeight() - 160 + (i > 12 ? 80 : 0),
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            width: 50,
            padding: 20,
            cornerRadius: 10,
            align: 'center',
            text: abc[i],
            fontSize: 25,
            fontFamily: 'Verdana',
            fontStyle: 'bold',
            textFill: 'black'
        });

        addCheckLetter(alphA, wordToGuess, wordLayer);
        padLayer.add(alphA);
    }

    // add the layer to the stage
    stage.add(wordLayer);
    stage.add(padLayer);
});
