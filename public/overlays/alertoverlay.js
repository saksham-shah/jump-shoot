function addAlertOverlay() {
    let title = '';
    let lines = [];
    let centre = false;
    let titleSize = 25;
    let tSize = 15;

    addOverlay('alert', {
        width: 400,
        height: 200,
        text: 'Important!',
        onDisplay: (titleText, text, centred) => {
            title = titleText;
            lines = wrapText(text, tSize, 350);
            centre = centred;
        },
        draw: () => {
            noStroke();
            fill(255);
            textAlign(CENTER);
            textSize(titleSize);

            text(title, 200, 40);

            let x = 200;
            if (!centre) {
                textAlign(LEFT);
                x = 25;
            }

            textSize(tSize);
            let y = 75;
            for (let line of lines) {
                text(line, x, y);
                y += tSize + 10;
            }

        }
    });

    function wrapText(txt, tSize, lineWidth) {
        push();
        textSize(tSize);
        let words = txt.split(' ');
        let line = '', lines = [], testLine = '', testWidth;
        while (words.length > 0) {
            let word = words.splice(0, 1)[0];
            testLine = line + word;
            if (words.length > 0) testLine += ' ';
            testWidth = textWidth(testLine);
            if (testWidth > lineWidth) {
                if (line == '') {
                    let [wordToAdd, remainingWord] = resizeWord(word, lineWidth);
                    lines.push(wordToAdd);
                    if (remainingWord.length > 0) {
                        words.unshift(remainingWord);
                    }
                } else {
                    lines.push(line);
                    line = '';
                    words.unshift(word);
                }
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        pop();
        return lines;
    }
    
    function resizeWord(word, lineWidth) {
        if (textWidth(word) <= lineWidth) return [word, ''];
    
        let i = 0, partialWord = '';
        while (i < word.length && textWidth(partialWord + word[i]) <= lineWidth) {
            partialWord += word[i];
            i++;
        }
    
        return [partialWord, word.substring(i)];
    }
}

screens.push(addAlertOverlay);