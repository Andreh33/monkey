import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { createOrderAlarm } from "../src/lib/order-alarm-audio";

class AudioParamStub {
  setValueAtTime() {}
  linearRampToValueAtTime() {}
}
class OscillatorStub {
  type = "sine";
  frequency = new AudioParamStub();
  onended: (() => void) | null = null;
  stops: Array<number | undefined> = [];
  disconnected = false;
  connect() {}
  disconnect() { this.disconnected = true; }
  start() {}
  stop(at?: number) { this.stops.push(at); }
}
class GainStub {
  gain = new AudioParamStub();
  disconnected = false;
  connect() {}
  disconnect() { this.disconnected = true; }
}
class ContextStub {
  static instances: ContextStub[] = [];
  state = "suspended";
  currentTime = 100;
  destination = {};
  oscillators: OscillatorStub[] = [];
  gains: GainStub[] = [];
  constructor() { ContextStub.instances.push(this); }
  async resume() { this.state = "running"; }
  async close() { this.state = "closed"; }
  createOscillator() { const oscillator = new OscillatorStub(); this.oscillators.push(oscillator); return oscillator; }
  createGain() { const gain = new GainStub(); this.gains.push(gain); return gain; }
}

function browser(t: TestContext, Constructor = ContextStub) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  ContextStub.instances = [];
  Object.defineProperty(globalThis, "window", { value: { AudioContext: Constructor }, configurable: true });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, "window", descriptor);
    else Reflect.deleteProperty(globalThis, "window");
  });
}

test("server rendering and unsupported audio do not instantiate a browser API", async () => {
  const alarm = createOrderAlarm();
  assert.equal(alarm.isRunning(), false);
  assert.equal(alarm.play(), false);
  assert.equal(await alarm.unlock(), false);
  alarm.dispose();
});

test("user activation unlocks lazily; repeats never overlap and silence stops immediately", async t => {
  browser(t);
  const alarm = createOrderAlarm();
  assert.equal(ContextStub.instances.length, 0);
  const unlocking = alarm.unlock();
  assert.equal(ContextStub.instances.length, 1);
  assert.equal(await unlocking, true);
  const context = ContextStub.instances[0];
  assert.equal(alarm.play(), true);
  assert.equal(alarm.play(), true);
  assert.equal(context.oscillators.length, 1);
  alarm.stop();
  assert.equal(context.oscillators[0].stops.at(-1), undefined);
  assert.equal(context.oscillators[0].disconnected, true);
  assert.equal(context.gains[0].disconnected, true);
  assert.equal(alarm.play(), true);
  assert.equal(context.oscillators.length, 2);
  context.oscillators[1].onended?.();
  assert.equal(context.gains[1].disconnected, true);
  assert.equal(alarm.play(), true);
  alarm.dispose();
  assert.equal(context.state, "closed");
  assert.equal(alarm.play(), false);
  assert.equal(await alarm.unlock(), false);
});

test("a blocked resume returns instead of leaving the activation button pending forever", async t => {
  class BlockedContext extends ContextStub {
    resume(): Promise<void> { return new Promise(() => {}); }
  }
  browser(t, BlockedContext);
  const alarm = createOrderAlarm();
  assert.equal(await alarm.unlock(), false);
  assert.equal(alarm.isRunning(), false);
  assert.equal(alarm.play(), false);
  alarm.dispose();
});

test("suspended or disposed contexts do not claim an alert was audible", async t => {
  browser(t);
  const alarm = createOrderAlarm();
  await alarm.unlock();
  ContextStub.instances[0].state = "suspended";
  assert.equal(alarm.isRunning(), false);
  assert.equal(alarm.play(), false);
  assert.equal(await alarm.unlock(), true);
  alarm.dispose();
  assert.equal(alarm.isRunning(), false);
});
