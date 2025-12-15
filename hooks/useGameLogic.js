import { useState } from 'react';

export default function useGameLogic() {
    const [word, setWord] = useState('');
    const [clue, setClue] = useState('');
    const [correctLetters, setCorrectLetters] = useState([]);
    const [wrongLetters, setWrongLetters] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);

    const handleGuess = (letter) => {
        if (!word) return;
        const upper = letter.toUpperCase();
        const letters = word.split('');
        const isHit = letters.includes(upper);
        if (isHit) {
            setCorrectLetters(prev => (prev.includes(upper) ? prev : [...prev, upper]));
        } else {
            setWrongLetters(prev => (prev.includes(upper) ? prev : [...prev, upper]));
        }
    };

    const resetGame = () => {
        setCorrectLetters([]);
        setWrongLetters([]);
        setGameStarted(false);
    };

    return {
        word,
        clue,
        setWord,
        setClue,
        correctLetters,
        wrongLetters,
        gameStarted,
        setGameStarted,
        handleGuess,
        resetGame,
    };
}
