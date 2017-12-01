import  TYPES from '../consts/index'
export default function(myAngular) {
  myAngular.directive('mng-controller', () => {
    return {
      scope: true,
      link (el, scope, exp) {
        const ctr = myAngular.get(exp + TYPES.CONTROLLERS_SUFFIX);
        myAngular.invoke(ctr, { $scope: scope });
      }
    }
  });
}

