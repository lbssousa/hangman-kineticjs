function addCheckLetter(box, word, layer) {
    box.on('mousedown touchstart', function() {
        checkLetter(box, word, layer);
        box.transitionTo({
            opacity: 0.2,
            duration: 0.5,
            easing: 'ease-out',
            callback: function () {
                box.off('mousedown touchstart');
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

function initWordLayer(wordLayer, word, wordWithoutAccents, height) {
    for (var i in word) {
        var letter = new Kinetic.Text({
            id: word[i] + 'letter' + i,
            name: 'letter' + wordWithoutAccents[i],
            x: 900,
            y: height / 4,
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
        letter.transitionTo({
            x: 55 + 90 * i,
            duration: 1.5,
            easing: 'strong-ease-out'
        });
    }
}

function resetWordLayer(wordLayer, word, wordWithoutAccents, height) {
    wordLayer.removeChildren();
    initWordLayer(wordLayer, word, wordWithoutAccents, height);
}

function initPadLayer(padLayer, wordWithoutAccents, wordLayer, height) {
    var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (var i in abc) {
        var letter = new Kinetic.Text({
            x: 15 + 60 * (i % 13),
            y: height - 160 + (i > 12 ? 80 : 0),
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

        addCheckLetter(letter, wordWithoutAccents, wordLayer);
        padLayer.add(letter);
    }
}

function resetPadLayer(padLayer, word, wordLayer) {
    var pad = padLayer.getChildren();

    for (i in pad) {
        var box = pad[i];

        if (box.getOpacity() < 1) {
            box.setTextFill('black');
            box.transitionTo({
                opacity: 1,
                duration: 0.5,
                easing: 'ease-out'
            });
        }

        addCheckLetter(box, word, wordLayer);
    }
}

$(document).ready(function() {
    var wordToGuess = getWord('fruits'),
        wordWithoutAccents = removeAccents(wordToGuess);

    var stage = new Kinetic.Stage({
        container: 'container',
        width: 800,
        height: 600
    });

    var padLayer = new Kinetic.Layer(),
        wordLayer = new Kinetic.Layer();

    initWordLayer(wordLayer, wordToGuess, wordWithoutAccents, stage.getHeight());
    initPadLayer(padLayer, wordWithoutAccents, wordLayer, stage.getHeight());

    // add the layer to the stage
    stage.add(wordLayer);
    stage.add(padLayer);

    document.getElementById('newgame').addEventListener('click', function() {
        wordToGuess = getWord('fruits');
        wordWithoutAccents = removeAccents(wordToGuess);
        resetWordLayer(wordLayer, wordToGuess, wordWithoutAccents, stage.getHeight());
        resetPadLayer(padLayer, wordWithoutAccents, wordLayer);
    }, false);
});
