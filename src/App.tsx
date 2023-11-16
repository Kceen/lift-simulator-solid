import { For, createEffect, createSignal, on } from 'solid-js'
import './App.css'
import { ICommand, ILiftState, MovingDirection } from './types'

function App() {
  let executionInProgress = false
  const [currentMovingDirection, setCurrentMovingDirection] = createSignal<MovingDirection>(
    MovingDirection.IDLE,
  )
  const [liftState, setLiftState] = createSignal<ILiftState>({
    currentFloor: 1,
    openedDoors: false,
  })
  const [commands, setCommands] = createSignal<ICommand[]>([])

  const [buttonsClickHistory, setButtonsClickHistory] = createSignal<string[]>([])

  createEffect(() => {
    console.log(commands())
  })

  createEffect(() => {
    console.log(currentMovingDirection())
  })

  createEffect(
    on(currentMovingDirection, () => {
      sortCommands()
    }),
  )

  const sortCommands = () => {
    const sortedCommands = [...commands()]
    sortedCommands.sort((command1, command2) => {
      if (command1.direction === command2.direction) {
        if (currentMovingDirection() === MovingDirection.UP) {
          return command1.floorNumber! - command2.floorNumber!
        } else {
          return command2.floorNumber! - command1.floorNumber!
        }
      }

      if (currentMovingDirection() === MovingDirection.UP) {
        return command1.direction === MovingDirection.UP ? -1 : 1
      } else {
        return command1.direction === MovingDirection.DOWN ? -1 : 1
      }
    })

    setCommands(sortedCommands)
  }

  function executeCommand() {
    executionInProgress = true

    const intervalId = setInterval(() => {
      const commandsTemp = [...commands()]
      const nextCommand = commandsTemp.shift()

      if (nextCommand?.type === 'GO_TO_FLOOR') {
        if (liftState().openedDoors) {
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            openedDoors: false,
          }))

          return
        }

        if (nextCommand.floorNumber === liftState().currentFloor) {
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            currentFloor: nextCommand?.floorNumber!,
            openedDoors: true,
          }))

          // COMMAND IS DONE, REMOVE IT FROM COMMANDS ARRAY
          setCommands(commandsTemp)
          if (commandsTemp.length === 0) {
            setCurrentMovingDirection(MovingDirection.IDLE)
          }
        }
        if (nextCommand.floorNumber! > liftState().currentFloor) {
          setCurrentMovingDirection(MovingDirection.UP)
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            currentFloor: prevLiftState.currentFloor + 1,
          }))
        }
        if (nextCommand.floorNumber! < liftState().currentFloor) {
          setCurrentMovingDirection(MovingDirection.DOWN)
          setLiftState((prevLiftState) => ({
            ...prevLiftState,
            currentFloor: prevLiftState.currentFloor - 1,
          }))
        }
      }

      if (commands().length === 0) {
        executionInProgress = false
        clearInterval(intervalId)
      }
    }, 1000)
  }

  const handleFloorButtonClick = (buttonNumber: number) => {
    setButtonsClickHistory([...buttonsClickHistory(), 'Clicked on number - ' + buttonNumber])

    if (
      commands().find((command) => command.floorNumber === buttonNumber) ||
      liftState().currentFloor === buttonNumber
    ) {
      return
    }

    const newCommandDirection: MovingDirection =
      buttonNumber > liftState().currentFloor ? MovingDirection.UP : MovingDirection.DOWN

    const newCommand: ICommand = {
      type: 'GO_TO_FLOOR',
      floorNumber: buttonNumber,
      direction: newCommandDirection,
    }

    setCommands([...commands(), newCommand])
    sortCommands()

    if (!executionInProgress) {
      executeCommand()
    }
  }

  return (
    <>
      <div>
        <p>current floor - {liftState().currentFloor}</p>
        <p>opened doors - {liftState().openedDoors ? 'true' : 'false'}</p>
      </div>

      <div class='building relative mb-24'>
        <div class='floors'>
          <For each={[5, 4, 3, 2, 1]}>
            {(floor) => (
              <div class='relative'>
                <div class='w-20 h-28 border border-black'></div>
                <div class='absolute top-0 -left-4'>{floor}</div>
              </div>
            )}
          </For>
        </div>
        <div
          style={{ bottom: `${liftState().currentFloor * 7 - 7}rem` }}
          class='lift absolute w-20 h-28 bottom-0 transition-all ease-linear duration-1000'
        >
          <div
            style={{
              transform: `${liftState().openedDoors ? 'translateX(-2rem)' : 'translateX(0)'}`,
            }}
            class='w-1/2 h-full bg-black inline-block duration-1000'
          ></div>
          <div
            style={{
              transform: `${liftState().openedDoors ? 'translateX(2rem)' : 'translateX(0)'}`,
            }}
            class='w-1/2 h-full bg-black inline-block duration-1000'
          ></div>
        </div>
      </div>

      <div>
        <For each={[1, 2, 3, 4, 5]}>
          {(buttonNumber) => (
            <button
              class='border p-6'
              onclick={() => {
                handleFloorButtonClick(buttonNumber)
              }}
            >
              {buttonNumber}
            </button>
          )}
        </For>
      </div>

      <div class='fixed top-4 right-4 border border-black p-4 text-2xl'>
        <For each={commands()}>
          {(command) => (
            <p>
              {command.floorNumber} - {command.direction}
            </p>
          )}
        </For>
        <p>current moving direction - {currentMovingDirection()}</p>
      </div>
    </>
  )
}

export default App
