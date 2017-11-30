let Provider = {
	_providers: {},
	_register(name, factory) {
		this._providers[name] = factory;
	},
	directive(name, fn) {
		this._register(name + this.DIRECTIVES_SUFFIX, fn);
	},
	controller(name, fn) {
		this._register(name + this.CONTROLLERS_SUFFIX, fn);
	},
	service(name, fn) {
		this._register(name, fn);
	},
	_cache: {
		$rootScope: new Scope()
	},
	get(name, locals) {
		if (this._cache[name]) {
			return this._cache[name];
		}
		let provider = this._providers[name];
		if (!provider || typeof provider !== 'function') {
			return null;
		}
		return (this._cache[name] = this.invoke(provider, locals));
	},
	annotate(fn) {
		const res = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '')
			.match(/\((.*?)\)/);
		if (res && res[1]) {
			return res[1].split(',').map((d) => {
				return d.trim();
			})
		}
		return [];
	},
	invoke(fn, locals = {}) {
		const dependents = this.annotate(fn).map((s) => {
			return locals[s] || this.get(s, locals);
		});
		return fn.apply(null, dependents);
	}
};
Provider.DIRECTIVES_SUFFIX = 'Directive';
Provider.CONTROLLERS_SUFFIX = 'Controller';


Provider.service('RESTfulService', function () {
	return function (url) {
		// make restful call & return promise
	};
});

Provider.controller('MainCtrl', function (RESTfulService) {
	RESTfulService('')
		.then(function (data) {
			alert(data);
		});
});

var ctrl = Provider.get('MainCtrl' + Provider.CONTROLLERS_SUFFIX);
Provider.invoke(ctrl);


// Compile
let DOMCompile = {
	bootStrap() {
		this.compile(document.children[0], Provider.get('$rootScope');

	},
	compile(ele, scope) {
		let dirs = this._getElDirectives(ele), directive;
		dirs.forEach((dir) => {
			directive = Provider.get(dir + Provider.DIRECTIVES_SUFFIX);
			if (directive.scope && !scopeCreated) {
				scope = scope.$new();
				scopeCreated = true;
			}
			dir.link(ele, scope, dir.value);
		});
		Array.prototype.slice.call(ele.children).forEach((c) => {
			this.compile(c, scope);
		});

	},
	_getElDirectives(ele) {
		let attrs = ele.attributes;
		let result = [];
		for (let i = 0; i < attrs.length; i += 1) {
			if (Provider.get(attrs[i].name + Provider.DIRECTIVES_SUFFIX)) {
				result.push({
					name: attrs[i].name,
					value: attrs[i].value
				});
			}
		}
		return result;
	}
}


// Scope

function Scope(parent, id) {
	this.$$watchers = [];
	this.$$children = [];
	this.$parent = parent;
	this.$id = id || 0;
}
Scope.prototype.$watch = function (exp, fn) {
	this.$$watchers.push({
		exp: exp,
		fn: fn,
		last: Utils.clone(this.$eval(exp))
	});
};

Scope.prototype.$new = function () {
	Scope.counter += 1;
	var obj = new Scope(this, Scope.counter);
	//设置原型链，把当前的scope对象作为新scope的原型，这样新的scope对象可以访问到父scope的属性方法
	Object.setPrototypeOf(obj, this);
	this.$$children.push(obj);
	return obj;
};
Scope.prototype.$destroy = function () {
	var pc = this.$parent.$$children;
	pc.splice(pc.indexOf(this), 1);
};

Scope.prototype.$digest = function () {
	var dirty, watcher, current, i;
	do {
		dirty = false;
		for (i = 0; i < this.$$watchers.length; i += 1) {
			watcher = this.$$watchers[i];
			current = this.$eval(watcher.exp);
			if (!Utils.equals(watcher.last, current)) {
				watcher.last = Utils.clone(current);
				dirty = true;
				watcher.fn(current);
			}
		}
	} while (dirty);
	for (i = 0; i < this.$$children.length; i += 1) {
		this.$$children[i].$digest();
	}
};
Scope.counter = 0;



Scope.prototype.$eval = function (exp) {
	var val;
	if (typeof exp === 'function') {
		val = exp.call(this);
	} else {
		try {
			with (this) {
				val = eval(exp);
			}
		} catch (e) {
			val = undefined;
		}
	}
	return val;
};


Provider.directive('ngl-bind', function () {
	return {
		scope: false,
		link: function (el, scope, exp) {
			el.innerHTML = scope.$eval(exp);
			scope.$watch(exp, function (val) {
				el.innerHTML = val;
			});
		}
	};
});


Provider.directive('ngl-model', function () {
	return {
		link:  function (el, scope, exp) {
			el.onkeyup = function () {
				scope[exp] = el.value;
				scope.$digest();
			};
			scope.$watch(exp, function (val) {
				el.value = val;
			});
		}
	};
});


Provider.directive('ngl-controller', function () {
	return {
		scope: true,
		link: function (el, scope, exp) {
			var ctrl = Provider.get(exp + Provider.CONTROLLERS_SUFFIX);
			Provider.invoke(ctrl, { $scope: scope });
		}
	};
});

Provider.directive('ngl-click', function () {
	return {
		scope: false,
		link: function (el, scope, exp) {
			el.onclick = function () {
				scope.$eval(exp);
				scope.$digest();
			};
		}
	};
});
