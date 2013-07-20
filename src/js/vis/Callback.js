vde.Vis.Callback = (function() {
	var callback = {
		_registered: {
			// type: [fns]
		}
	};

	callback.register = function(type, caller, cb) {
		this._registered[type] || (this._registered[type] = []);
		this._registered[type].push({
			caller: caller,
			callback: cb
		});
	};

	callback.deregister = function(type, caller) {
		var del = [], regd = (this._registered[type] || []);
		regd.forEach(function(r, i) {
			if(r.caller == caller) del.push(i);
		});

		del.forEach(function(d) { regd.splice(d, 1); })
	};

	callback.run = function(type, item, opts) {
		opts.item = item;
		(this._registered[type] || []).forEach(function(r) {
			var cb = r.callback;
			cb.call(r.caller, opts);
		});
	};

	return callback;
})();