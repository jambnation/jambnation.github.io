import "./App.css";
import { maxGuesses } from "./util";
import Game from "./Game";
import { useEffect } from "react";

function App() {
  const dark = true;
  const colorBlind = false;
  const difficulty = 0;
  const keyboard = "12345-67890-BE";
  const enterLeft = false;

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    setTimeout(() => {
      document.body.style.transition = "0.3s background-color ease-out";
    }, 1);
  }, [dark]);

  return (
    <div className={"App-container" + (colorBlind ? " color-blind" : "")}>
      <h1>
        <span
          style={{
            color: "inherit",
            fontStyle: "inherit",
          }}>
          COORDLE
        </span>
      </h1>
      <Game
        maxGuesses={maxGuesses}
        hidden={false}
        colorBlind={colorBlind}
        keyboardLayout={keyboard.replaceAll(
          /[BE]/g,
          (x) => (enterLeft ? "EB" : "BE")["BE".indexOf(x)]
        )}
      />
    </div>
  );
}

export default App;
