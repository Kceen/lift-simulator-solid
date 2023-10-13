export interface ICommand {
  type: "GO_TO_FLOOR" | "OPEN_DOORS" | "CLOSE_DOORS";
  data?: number;
}

export interface ILiftState {
  currentFloor: number;
  openedDoors: boolean;
}
