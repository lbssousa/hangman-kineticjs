function addCheckLetter(box, word, layer) {
    box.on('mousedown', function() {
        checkLetter(box, word, layer);
        box.transitionTo({
            opacity: 0.2,
            duration: 0.5,
            easing: 'ease-out',
            callback: function () {
                box.setListening(false);
            }
        });
    });
}

function showLetter(placeholder) {
    placeholder.transitionTo({
        scale: {
            x: 0.01 // Firefox crashes the transition if scale.x is set to 0 (tested on 15.0.1)
        },
        duration: 0.5,
        easing: 'ease-in',
        callback: function () {
            placeholder.setText(placeholder.getId()[0]);
            placeholder.transitionTo({
                scale: {
                    x: 1
                },
                duration: 0.5,
                easing: 'ease-out'
            });
        }
    });
}

function checkLetter(box, wordWithoutAccents, layer) {
    for (var i in wordWithoutAccents) {
        if (box.getText() == wordWithoutAccents[i]) {
            box.setTextFill('blue');
            var shapes = layer.get('.letter' + wordWithoutAccents[i])

            for (var j in shapes) {
                showLetter(shapes[j]);
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

function removeAccents(word) {
    var s = word;

    var diacritics = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g,  // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];

    var chars = ['A','a','E','e','I','i','O','o',
                 'U','u','N','n','C','c'];

    for (var i = 0; i < diacritics.length; i++)
    {
        s = s.replace(diacritics[i], chars[i]);
    }

    return s;
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
        wordWithoutAccents = removeAccents(wordToGuess),
        abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (var i in wordToGuess) {
        var letter = new Kinetic.Text({
            id: wordToGuess[i] + 'letter' + i,
            name: 'letter' + wordWithoutAccents[i],
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

        addCheckLetter(alphA, wordWithoutAccents, wordLayer);
        padLayer.add(alphA);
    }

    // add the layer to the stage
    stage.add(wordLayer);
    stage.add(padLayer);
});
