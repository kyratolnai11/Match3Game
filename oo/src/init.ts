import { Board, Generator } from "./board1";
import { Model } from "./model";
import { View } from "./view";
import { Controller } from "./controller";

class SequenceGenerator implements Generator<string> {
  private sequence: string;
  private index: number;

  constructor(sequence: string) {
    this.sequence = sequence;
    this.index = 0;
  }

  next(): string {
    const n = this.sequence.charAt(this.index);
    this.index = (this.index + 1) % this.sequence.length;
    return n;
  }
}

async function init() {
  const generator = new SequenceGenerator("ABA");
  const board = new Board<String>(generator, 4, 3);
  const model = new Model<String>(board);
  const controller = new Controller<String>(model);
  const view = new View(window, controller);
  model.addObserver((m) => view.view(m));
  view.view(model);
}

init();
