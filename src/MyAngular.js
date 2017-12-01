import Scope from './Scope';
import TYPES from './consts/index'

export default class MyAngular {
  constructor () {
    this._cache = {
      $rootScope: new Scope()
    }
    this._providers = {};
  }


  _register (name, service) {
    this._providers[name] = service;
  }

  get (name, locals) {
    if (this._cache[name]) {
      return this._cache[name];
    }
    let provider = this._providers[name];
    if (!provider || typeof provider !== 'function') {
      return null;
    }
    return (this._cache[name] = this.invoke(provider, locals));
  }

  static annotate (fn) {
    if (fn) {
      const res = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '')
        .match(/\((.*?)\)/);
      if (res && res[1]) {
        return res[1].split(',').map((d) => {
          return d.trim();
        })
      }
    }
    return [];
  }

  invoke (fn, locals = {}) {
    const dependents = MyAngular.annotate(fn).map((s) => {
      return locals[s] || this.get(s, locals);
    });
    return fn.apply(null, dependents);
  }

  directive (name, fn) {
    this._register(name + TYPES.DIRECTIVES_SUFFIX, fn);
  }

  controller (name, fn) {
    this._register(name + TYPES.CONTROLLERS_SUFFIX, function() {
      return fn;
    });
  }

  service (name, fn) {
    this._register(name, fn);
  }
}

