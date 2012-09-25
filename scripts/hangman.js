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

function showLetter(placeholder, word, index) {
    placeholder.transitionTo({
        opacity: 0,
        duration: 0.3,
        easing: 'ease-out',
        callback: function () {
            placeholder.setText(word[index]);
            placeholder.transitionTo({
                opacity: 1,
                duration: 0.3,
                easing: 'ease-out'
            });
        }
    });
}

function checkLetter(box, word, layer) {
    var wordWithoutAccents = removeAccents(word);

    for (var i in word) {
        if (box.getText() == wordWithoutAccents[i]) {
            box.setTextFill('blue');
            var shapes = layer.get('.letter' + wordWithoutAccents[i])

            for (var j in shapes) {
                var shape = shapes[j];
                var index = shape.getId()[0];
                showLetter(shape, word, index);
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
        abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (var i in wordToGuess) {
        var letter = new Kinetic.Text({
            id: i + 'letter' + wordToGuess[i],
            name: 'letter' + removeAccents(wordToGuess)[i],
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
