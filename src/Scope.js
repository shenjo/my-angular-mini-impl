export default class Scope {
  constructor (parentScope = undefined, scopeId = 0) {
    this.$$watchers = [];
    this.$$children = [];
    this.$parent = parentScope;
    this.$id = scopeId;
  }

  $eval (exp) {
    let type = typeof exp, val;
    if (type === 'function') {
      val = exp.call(this);
    } else {
      val = this[exp];
    }
    return val;
  }

  $watch (exp, fn) {
    this.$$watchers.push({
      exp, fn, last: this.$eval(exp)
    })
  }

  $new () {
    let newScope = new Scope(this, ++Scope.counter)
    this.$$children.push(newScope);
    return newScope;
  }

  $digest () {
    this.$$watchers.forEach((watcher) => {
      let newValue = this.$eval(watcher.exp);
      let oldValue = watcher.last;
      if (newValue !== oldValue) {
        watcher.last = newValue;
        watcher.fn(newValue);
      }
    });
    this.$$children.forEach((child) => {
      child.$digest();
    })
  }
}

Scope.counter = 0;
