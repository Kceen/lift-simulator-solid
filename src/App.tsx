import { For, createEffect, createSignal } from "solid-js";
import "./App.css";
import { ICommand, ILiftState } from "./types";

function App() {
  let executionInProgress = false;
  const [liftState, setLiftState] = createSignal<ILiftState>({
    currentFloor: 1,
    openedDoors: false,
  });
  const [commands, setCommands] = createSignal<ICommand[]>([]);

  createEffect(() => {
    console.log(commands());
  });

  function executeCommand() {
    executionInProgress = true;

    const intervalId = setInterval(() => {
      const commandsTemp = [...commands()];
      const nextCommand = commandsTemp.shift();

      if (nextCommand?.type === "GO_TO_FLOOR") {
        if (liftState().openedDoors) {
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            openedDoors: false,
          }));

          return;
        }

        if (nextCommand.data === liftState().currentFloor) {
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            currentFloor: nextCommand?.data!,
            openedDoors: true,
          }));

          // COMMAND IS DONE, REMOVE IT FROM COMMANDS ARRAY
          setCommands(commandsTemp);
        }
        if (nextCommand.data! > liftState().currentFloor) {
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            currentFloor: prevLiftState.currentFloor + 1,
          }));
        }
        if (nextCommand.data! < liftState().currentFloor) {
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            currentFloor: prevLiftState.currentFloor - 1,
          }));
        }
      }

      if (commands().length === 0) {
        executionInProgress = false;
        clearInterval(intervalId);
      }
    }, 1000);
  }

  return (
    <>
      <div>
        <p>current floor - {liftState().currentFloor}</p>
        <p>opened doors - {liftState().openedDoors ? "true" : "false"}</p>
      </div>

      <div class="building relative mb-24">
        <div class="floors">
          <For each={[5, 4, 3, 2, 1]}>
            {(floor) => (
              <div class="relative">
                <div class="w-20 h-28 border border-black"></div>
                <div class="absolute top-0 -left-4">{floor}</div>
              </div>
            )}
          </For>
        </div>
        <div
          style={{ bottom: `${liftState().currentFloor * 7 - 7}rem` }}
          class="lift absolute w-20 h-28 bottom-0 transition-all ease-linear duration-1000"
        >
          <div
            style={{
              transform: `${
                liftState().openedDoors ? "translateX(-2rem)" : "translateX(0)"
              }`,
            }}
            class="w-1/2 h-full bg-black inline-block duration-1000"
          ></div>
          <div
            style={{
              transform: `${
                liftState().openedDoors ? "translateX(2rem)" : "translateX(0)"
              }`,
            }}
            class="w-1/2 h-full bg-black inline-block duration-1000"
          ></div>
        </div>
      </div>

      <div>
        <For each={[1, 2, 3, 4, 5]}>
          {(buttonNumber) => (
            <button
              class="border p-6"
              onclick={() => {
                setCommands((prevCommands) => [
                  ...prevCommands,
                  { type: "GO_TO_FLOOR", data: buttonNumber },
                ]);

                if (!executionInProgress) {
                  executeCommand();
                }
              }}
            >
              {buttonNumber}
            </button>
          )}
        </For>
      </div>
    </>
  );
}

export default App;
