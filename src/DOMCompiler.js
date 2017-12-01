import MyAngular from './MyAngular';
import TYPES from './consts/index'

export default class DOMCompiler {
  constructor (deps) {
    this.angular = new MyAngular();
    deps.forEach((func) => {
      func(this.angular);
    });
  }

  bootStrap () {
    this.compile(document.body, this.angular.get('$rootScope'));
  }

  _getElDirectives (dom, scope) {
    let hasCreateScope = false;
    let dirs = [...dom.attributes].map((attribute) => {
      let directive = this.angular.get(attribute.name + TYPES.DIRECTIVES_SUFFIX);
      return {
        directive,
        value: attribute.value
      }
    }).filter((directive) => {
      return directive.directive
    });
    dirs.forEach((dir) => {
      if (dir.directive.scope && !hasCreateScope) {
        scope = scope.$new();
      }
      dir.directive.link(dom, scope, dir.value);
    });
    return scope;
  }

  compile (dom, scope) {
    let $scope = this._getElDirectives(dom, scope);
    [...dom.children].forEach((childDom) => {
      this.compile(childDom, $scope);
    })

  }
}