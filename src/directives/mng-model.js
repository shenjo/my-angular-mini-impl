export default function(myAngular) {
  myAngular.directive('mng-model', () => {
    return {
      link (el, scope, exp) {
        el.onkeyup = () => {
          scope[exp] = el.value;
          scope.$digest();
        };
        scope.$watch(exp, (val) => {
          el.value = val;
        })
      }
    }
  });
}
