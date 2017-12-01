import DOMCompiler from './DOMCompiler';
import mngCtr from './directives/mng-controller';
import mdlCtr from './directives/mng-model';

const deps = [mngCtr,mdlCtr];
let compiler = new DOMCompiler(deps);
compiler.angular.controller('firstCtr',function($scope) {
  $scope.hello = 'shenjo'
});


compiler.bootStrap();





