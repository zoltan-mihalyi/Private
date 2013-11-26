(function () {
    var nextid = 0;

    function PublicMethods() {
    }

    var ClassMethods = {
        setPublic: function (name, value) {
            this._public[name] = value;
        },
        parent: function (name) {
            var method = this._parent.prototype[name];
            if (method) {
                return method.apply(this, [].slice.call(arguments, 1));
            } else {
                throw 'Method ' + name + ' does not exists in parent class.';
            }
        }
    };

    function PrivateDataAndMethods(methods) {
        var i;

        this.init = function () {
        };
        for (i in methods) {
            this[i] = methods[i];
        }
    }

    function proxy(method, id) {
        return function () {
            return method.apply(this._private[id], arguments);
        }
    }

    function Class(parent, methods) {
        var i, privateMethods = {}, parts;
        if (!methods) {
            methods = parent;
            parent = null;
        }

        for (i in methods) { //separate private methods
            parts = i.split(' ');
            if (parts[0] === 'private') {
                privateMethods[parts[1]] = methods[i];
                delete methods[i];
            }
        }

        function Class() {

            if (parent) {
                parent.apply(this, arguments);
            } else {
                this._private = {};
            }
            PrivateDataAndMethods.prototype = this;
            this._private[id] = new PrivateDataAndMethods(privateMethods);
            this._private[id]._public = this;
            this._private[id].init.apply(this._private[id], arguments);
        }

        if (parent) {
            PublicMethods.prototype = parent.prototype;
        } else {
            PublicMethods.prototype = ClassMethods;
        }
        Class.prototype = new PublicMethods();
        if (parent) {
            Class.prototype._parent = parent;
        }

        var id = ++nextid;

        for (i in methods) {
            Class.prototype[i] = proxy(methods[i], id);
        }

        return Class;
    }

    Private = {
        Class: Class
    };
})();