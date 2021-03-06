import { Action } from "./Action";
import { Game } from "./Game";

export enum Color {
  Air,
  Water,
  Energy,
  Radiation,
  Joker,
}

/* A generic interface for all the cards 

   It is implemented by the class Generator, Virus,
   Firewall and ActionSpe
*/
export interface Card {
  color: Color;
  action(game: Game, action: Action): void;
}
