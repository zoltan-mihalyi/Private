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
        };
    }

    function Class(parent, methods) {
        var id = ++nextid;
        var i, privateMethods = {}, abstractMethods = {}, finalMethods={}, hasAbstract = false, parts;
        if (!methods) {
            methods = parent;
            parent = null;
        }

        for (i in methods) { //separate private and abstract methods
            parts = i.split(' ');
            if (parts.length > 1) {
                switch (parts[0]) {
                    case 'private':
                        privateMethods[parts[1]] = methods[i];
                        delete methods[i];
                        break;
                    case 'abstract':
                        abstractMethods[parts[1]] = methods[i];
                        hasAbstract = true;
                        delete methods[i];
                        break;
                    case 'final':
                        finalMethods[parts[1]] = methods[i];
                        break;
                    default:
                        throw 'Undefined keyword ' + parts[0];

                }
            }
        }

        if (parent) {
            for (i in parent.abstractMethods) {
                if (abstractMethods[i] === undefined && methods[i] === undefined) {
                    throw 'Abstract method ' + i + ' is not implemented or marked abstract!';
                }
            }

            for (i in parent.finalMethods) { //TODO recursive upwards
                if(i in methods){
                    throw 'Final method ' + i +' cannot be overridden.';
                }
            }
        }

        function Class() {
            var current = Class, cid;
            if (hasAbstract) { //disable abstract class instantiation
                throw 'Trying to instantiate an abstract class!';
            }

            this._private = {};

            PrivateDataAndMethods.prototype = this;
            while (current !== null) {
                cid = current.id;
                this._private[cid] = new PrivateDataAndMethods(current.privateMethods);
                this._private[cid]._public = this;
                this._private[cid].init.apply(this._private[cid], arguments);
                current = current.parent;
            }
        }

        Class.parent = parent;
        Class.privateMethods = privateMethods;
        Class.abstractMethods = abstractMethods;
        Class.finalMethods = finalMethods;
        Class.id = id;

        if (parent) {
            PublicMethods.prototype = parent.prototype;
        } else {
            PublicMethods.prototype = ClassMethods;
        }
        Class.prototype = new PublicMethods();
        if (parent) {
            Class.prototype._parent = parent;
        }


        for (i in methods) {
            Class.prototype[i] = proxy(methods[i], id);
        }


        return Class;
    }

    Private = {
        class: Class
    };
})();