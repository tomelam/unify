(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["module", "./main", "heya-logger/assert"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(module, require("./main"), require("heya-logger/assert"));
	}
})(function(module, unify, logger){
	"use strict";

	var any = unify.any, isVar = unify.isVariable,
		isWrapped = unify.isWrapped, open = unify.open,
		logger = logger.getLogger(module);

	function identity(x){ return x; }

	function Command(f, pattern){
		this.f = f;
		this.p = pattern;
	}

	function assembleArray(wrap){
		return function(stackOut){
			var array = [], pattern = this.p;
			for(var i = 0; i < pattern.length; ++i){
				if(pattern.hasOwnProperty(i)){
					array[i] = stackOut.pop();
				}
			}
			stackOut.push(wrap(array));
		}
	}

	function assembleObject(wrap){
		return function(stackOut){
			var object = {}, pattern = this.p;
			for(var k in pattern){
				if(pattern.hasOwnProperty(k)){
					object[k] = stackOut.pop();
				}
			}
			stackOut.push(wrap(object));
		};
	}

	return function preprocess(o, nonExactObjects, nonExactArrays){
		if(!nonExactArrays && !nonExactObjects){
			return o;
		}

		// non-recursive stack-based processing of an object tree
		var stackIn = [o], stackOut = [];
		while(stackIn.length){
			var x = stackIn.pop();
			// eliminate all non-processed objects
			if(!x || typeof x != "object" || x instanceof Date || x instanceof RegExp ||
					x === any || isVar(x) || isWrapped(x)){
				stackOut.push(x);
				continue;
			}
			// process commands
			if(x instanceof Command){
				x.f(stackOut);
				continue;
			}
			// process naked arrays
			if(x instanceof Array){
				stackIn.push(new Command(assembleArray(nonExactArrays ? open : identity), x));
				for(var i = 0; i < x.length; ++i){
					if(x.hasOwnProperty(i)){
						stackIn.push(x[i]);
					}
				}
				continue;
			}
			// process naked objects
			stackIn.push(new Command(assembleObject(nonExactObjects ? open : identity), x));
			for(var k in x){
				if(x.hasOwnProperty(k)){
					stackIn.push(x[k]);
				}
			}
		}

		// result
		eval(logger.assert("stackOut.length == 1"));
		return stackOut[0];
	};
});