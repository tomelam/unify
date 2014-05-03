/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./main"], function(unify){
	"use strict";

	var Var = unify.Variable;

	function Ref(variable, value){
		this.variable = typeof variable == "string" ? new Var(variable) : variable;
		this.value = value;
	}
	Ref.prototype = Object.create(Var.prototype);

	Ref.prototype.unify = function(val, ls, rs, env){
		ls.push(this.value, this.variable);
		rs.push(val, val);
		return true;
	};

	Ref.ref = function(variable, value){ return new Ref(variable, value); }

	return Ref;
});
