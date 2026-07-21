import { Wire, CompositeGate, NandGate, Simulator } from './src/engine.js';
import { NotGate } from './src/gates.js';

const wireA = new Wire("A");
const wireB = new Wire("B");
const wireOut = new Wire("Out");

const n1 = new NotGate(wireOut, wireA, "N1");
const n2 = new NotGate(wireA, wireB, "N2");
const n3 = new NotGate(wireB, wireOut, "N3");
wireOut.state = false;

Simulator.stabilize();
console.log("After stabilize:");
console.log("Queue size:", Simulator['eventQueue'].size); // Wait, eventQueue is private.
console.log("wireOut:", wireOut.state, "wireA:", wireA.state, "wireB:", wireB.state);

for (let i = 0; i < 10; i++) {
    Simulator.step(1);
    console.log(`Step ${i}: wireOut: ${wireOut.state} wireA: ${wireA.state} wireB: ${wireB.state}`);
}
