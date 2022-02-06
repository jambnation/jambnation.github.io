import { useRef, useState } from "react";
import { Row, RowState } from "./Row";
import { Clue, clue, describeClue } from "./clue";
import { Keyboard } from "./Keyboard";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
  colorBlind: boolean;
  keyboardLayout: string;
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [wordLength] = useState(6);
  const [target] = useState<string>("438241");
  const [hint, setHint] = useState<string>(`Make your first guess!`);
  const tableRef = useRef<HTMLTableElement>(null);
  const startNextGame = () => {
    setHint("");
    setGuesses([]);
    setCurrentGuess("");
    setGameState(GameState.Playing);
  };

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[0-9]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key).slice(0, wordLength)
      );
      tableRef.current?.focus();
      setHint("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Too short");
        return;
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");

      if (currentGuess === target) {
        setHint("Good job! Now go find it!");
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint("DNF! Press Enter and try again...");
        setGameState(GameState.Lost);
      } else {
        setHint("");
      }
    }
  };

  let letterInfo = new Map<string, Clue>();
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break;
          const old = letterInfo.get(letter);
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue);
          }
        }
      }
      return (
       <Row
          key={i}
          wordLength={wordLength}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length
              ? RowState.Editing
              : RowState.Pending
          }
          cluedLetters={cluedLetters}
        />
      );
    });

  const headerRow = Array(wordLength).fill(undefined)
    .map((_, i) => { return (
      <td className="Row-letter letter-absent">{String.fromCharCode(i + 'A'.charCodeAt(0))}</td>
    )});
  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
        Find the cache at
        <br/>
        <b>N 33° 45.ABC</b>
        <br/>
        <b>W 117° 45.DEF</b>
        <br/><br/>
      <table
        className="Game-rows"
        tabIndex={0}
        aria-label="Table of guesses"
        ref={tableRef}
      >
        <tbody>
          <tr className="Row">
           {headerRow}
          </tr>
          {tableRows}
        </tbody>
      </table>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? "text" : "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {hint || `\u00a0`}
      </p>
      <Keyboard
        layout={props.keyboardLayout}
        letterInfo={letterInfo}
        onKey={onKey}
      />
    </div>
  );
}

export default Game;
