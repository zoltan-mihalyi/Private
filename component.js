(function () {
    var nextid = 0;

    function PublicMethods() {
    }

    var ClassMethods = {
        setPublic: function (name, value) {
            this._public[name] = value;
        },
        parent: function (name) {
            if(!this._parent){
                throw 'No parent class!';
            }
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
        var id = ++nextid, realName, Class, current, i, privateMethods = {}, abstractMethods = {}, finalMethods={}, declaredMethods={}, hasAbstract = false, parts;
        if (!methods) {
            methods = parent;
            parent = null;
        }

        for (i in methods) { //separate private and abstract methods
            parts = i.split(' ');
            
            if (parts.length > 1) {
                realName=parts[1]; //real 
                
                switch (parts[0]) {
                    case 'private':
                        privateMethods[realName] = methods[i];
                        delete methods[i];
                        break;
                    case 'abstract':
                        abstractMethods[realName] = methods[i];
                        hasAbstract = true;
                        delete methods[i];
                        break;
                    case 'final':
                        finalMethods[realName] = methods[i];
                        break;
                    default:
                        throw 'Undefined keyword ' + parts[0];

                }
            }else{
                realName=i;
            }
            if(realName in declaredMethods){ //duplicate method with different modifier
                throw 'Method ' + realName + ' is duplicated with different modifiers.';
            }
            declaredMethods[realName]=methods[i];
        }
        
        if (parent) {
            for (i in parent.abstractMethods) { //abstract check
                if (abstractMethods[i] === undefined && methods[i] === undefined) {
                    throw 'Abstract method ' + i + ' is not implemented or marked abstract!';
                }
            }
            
            current=parent;
            while(current!==null){ //final check
                for (i in current.finalMethods) {
                    if(i in methods){
                        throw 'Final method ' + i +' cannot be overridden.';
                    }
                }
                current=current.parent;
            }
            
            current=parent;
            while(current!==null){ //mark abstract a method implemented in parent classes?
                for (i in current.methods) {
                    if(i in abstractMethods){
                        throw 'Cannot mark abstract method ' + i +', which is implemented in an ancestor class.';
                    }
                }
                current=current.parent;
            }
        }
        if (hasAbstract) { //disable abstract class instantiation
            Class=function(){
                throw 'Trying to instantiate an abstract class!';
            };
        }else{
            Class=function() {
               var current = Class, cid;
               this._private = {};

               PrivateDataAndMethods.prototype = this;
               while (current !== null) {
                   cid = current.id;
                   this._private[cid] = new PrivateDataAndMethods(current.privateMethods);
                   this._private[cid]._public = this;
                   this._private[cid].init.apply(this._private[cid], arguments);
                   current = current.parent;
               }
           };
        }
        Class.parent = parent;
        Class.privateMethods = privateMethods;
        Class.abstractMethods = abstractMethods;
        Class.finalMethods = finalMethods;
        Class.methods=methods;
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