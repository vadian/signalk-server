import { Delta } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type DeltaInputHandler = (
  delta: object,
  next: (delta: object) => void
) => void

export default class DeltaChain {
  chain: any[]
  next: any[]
  constructor(private dispatchMessage: (msg: Delta) => any) {
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
    this.next = this.chain.map((chainElement: any, index: number) => {
      return (msg: any) => {
        this.doProcess(index + 1, msg)
      }
    })
  }
}
