import { Delta, NormalizedDelta } from './types'

export type DeltaInputHandler = (
  delta: NormalizedDelta,
  next: DeltaInputHandler
) => void

export default class DeltaChain {
  chain: DeltaInputHandler[]
  next: DeltaInputHandler[]
  constructor(private dispatchMessage: (msg: Delta) => void) {
    this.chain = []
    this.next = []
  }

  process(msg: Delta) {
    return this.doProcess(0, msg)
  }

  doProcess(index: number, msg: Delta) {
    if (index >= this.chain.length) {
      this.dispatchMessage(msg)
      return
    }
    this.chain[index](msg, this.next[index])
  }

  register(handler: DeltaInputHandler) {
    this.chain.push(handler)
    this.updateNexts()
    return () => {
      const handlerIndex = this.chain.indexOf(handler)
      if (handlerIndex >= 0) {
        this.chain.splice(handlerIndex, 1)
        this.updateNexts()
      }
    }
  }

  updateNexts() {
    this.next = this.chain.map((chainElement: unknown, index: number) => {
      return (msg: NormalizedDelta) => {
        this.doProcess(index + 1, msg)
      }
    })
  }
}
