export interface ICommand {
  type: 'GO_TO_FLOOR' | 'OPEN_DOORS' | 'CLOSE_DOORS'
  floorNumber?: number
  direction?: MovingDirection
}

export interface ILiftState {
  currentFloor: number
  openedDoors: boolean
}

export enum MovingDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  IDLE = 'IDLE',
}
