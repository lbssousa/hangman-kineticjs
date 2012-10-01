function getWord(category) {
    var words = null;

    // This is needed in order to store
    // $.getJSON() output in a variable.
    $.ajaxSetup({
        async: false
    });

    // WARNING: the following uses XMLHttpRequest,
    // and MAY NOT work from local file access!!
    // Please enable local XMLHttpRequest support in your browser
    // or install this script in a web server.
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

function initLetter(letters, callback) {
    letters.shift().transitionTo({
        scale: {
            x: 1,
            y: 1
        },
        opacity: 1,
        duration: 0.3,
        easing: 'back-ease-out',
        callback: function() {
            if (letters.length < 1) {
                callback();
            }
            else {
                initLetter(letters, callback);
            }
        }
    });
}

$(document).ready(function() {
    var stage = new Kinetic.Stage({
        container: 'container',
        width: 800,
        height: 600
    });

    var padLayer = new Kinetic.Layer(),
        wordLayer = new Kinetic.Layer();

    padLayer.initialize = function(height) {
        var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (var i = 0; i < abc.length; i++) {
            var letter = new Kinetic.Text({
                id: 'padletter' + abc[i],
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
                textFill: 'black',
            });

            letter.check = function(wordLayer) {
                var matches = wordLayer.get('.letter' + this.getText());

                if (matches.length > 0) {
                    this.setTextFill('blue');

                    // This makes use of new Collection class,
                    // introduced in KineticJS 4.0.2
                    matches.each(function(index, shape) {
                        shape.transitionTo({
                            // This may not work in Firefox if scale is set to 0.
                            scale: {
                                x: 0.01
                            },
                            duration: 0.5,
                            easing: 'ease-in',
                            callback: function () {
                                shape.setText(shape.getId()[0]);
                                shape.transitionTo({
                                    scale: {
                                        x: 1
                                    },
                                    duration: 0.5,
                                    easing: 'ease-out'
                                });
                            }
                        });
                    });
                }
                else {
                    this.setTextFill('red');
                }
            }

            this.add(letter);
        }
    }

    padLayer.reset = function() {
        // This makes use of new Collection class, introduced in KineticJS 4.0.2
        this.get('Shape').each(function(index, shape) {
            shape.off('mousedown touchstart');

            if (shape.getOpacity() < 1) {
                shape.setTextFill('black');
                shape.transitionTo({
                    opacity: 1,
                    duration: 0.5,
                    easing: 'ease-out'
                });
            }
        });
    }

    wordLayer.word = getWord('fruits');
    wordLayer.wordWithoutAccents = removeAccents(wordLayer.word);
    wordLayer.initialize = function(padLayer, height) {
        for (var i = 0; i < this.word.length; i++) {
            var letter = new Kinetic.Text({
                id: this.word[i] + 'letter' + i,
                name: 'letter' + this.wordWithoutAccents[i],
                x: 55 + 90 * i,
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
                scale: {
                    x: 0.01,
                    y: 0.01
                },
                opacity: 0
            });

            this.add(letter);
        }

        var thiz = this;
        initLetter(this.get('Shape'), function() {
            thiz.addCheck(padLayer);
        }); 
    }

    wordLayer.reset = function(padLayer, height) {
        // This makes use of new Collection class, introduced in KineticJS 4.0.2
        // Just remembering, the following statements are equivalent:
        //// wordLayer.get('Shape').apply('remove');
        //// wordLayer.get('Shape').each(function() { this.remove(); });
        //// wordLayer.get('Shape').each(function(index, shape) { shape.remove(); });

        // timeout in milliseconds
        var timeout = 300;

        this.get('Shape').each(function(index, letter) {
            letter.transitionTo({
                // This may not work in Firefox if scale is set to 0.
                scale: {
                    x: 0.01,
                    y: 0.01
                },
                opacity: 0,
                duration: timeout / 1000,
                easing: 'ease-in',
                callback: function() {
                    letter.remove();
                }
            });
        });

        // transitionTo() method is asynchronous, so we need to set a timeout here.
        setTimeout(function() {
            wordLayer.initialize(padLayer, height);
        }, timeout + 150);
    }

    wordLayer.addCheck = function(padLayer) {
        var layer = this;
        // This makes use of new Collection class, introduced in KineticJS 4.0.2
        padLayer.get('Shape').each(function(index, shape) {
            shape.on('mousedown touchstart', function() {
                this.check(layer);
                this.off('mousedown touchstart');
                this.transitionTo({
                    opacity: 0.2,
                    duration: 0.5,
                    easing: 'ease-out'
                });
            });
        });
    }

    padLayer.initialize(stage.getHeight());
    wordLayer.initialize(padLayer, stage.getHeight());

    stage.add(wordLayer);
    stage.add(padLayer);

    $('#newgame').click(function() {
        wordLayer.word = getWord('fruits');
        wordLayer.wordWithoutAccents = removeAccents(wordLayer.word);
        padLayer.reset();
        wordLayer.reset(padLayer, stage.getHeight());
    });
});
