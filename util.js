// @flow

export function checkProps(obj : Object, ...props : Array<string>) {
  let prop = props.shift()
  let cursor = obj
  while (prop !== undefined) {
    if (!(prop in cursor) || cursor[prop] === undefined)
      throw `Property: ${prop} is not in the object`

    prop = props.shift()
    cursor = cursor[prop]
  }
}

export function filterHashUrl(x : string) {
  if (x.indexOf('/') === -1)
    throw "The input hash_url should be in this format: `xx/xx/xx/xx/xx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`"

  const start = x[0] === '/' ? 1 : 0
  const end = x.slice(-1) === '/' ? -1 : x.length

  return x.slice(start, end)
}

export class OpStep {
  main_fn: any => any
  next_nodes: Array<OpStep>

  constructor(main_fn : any => any, ...next_nodes : Array<OpStep>) {
    this.main_fn = main_fn
    this.next_nodes = next_nodes
  }

  run(...args : Array<any>) {
    const result = this.main_fn.apply(this, args)
    if (typeof result === 'boolean') {
      if (result) 
        return this.next_nodes[0] && this.next_nodes[0].run()
      else
        return this.next_nodes[1] && this.next_nodes[1].run()
    }

    if (result instanceof Promise) {
      return result.then(x => this.next_nodes[0] && this.next_nodes[0].run(x))
      .catch(err => {
        throw `OpStep error caught: ${err}`
      })
    }
  }
}