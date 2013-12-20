X = Private.class({
    'private init': function () {
        this.a();
    },
    'abstract a': null,
    'static st': 15
});

A = Private.class(X, {
    'private init': function () { //init function is called automatically.
        this.pr = 1; //private member
        this.setPublic('pu', 2); //set public member
        this.priv(); //call private method
    },
    'private priv': function () {//private keyword in method name makes it accessible only in the object's methods.
        this.pr = 3; //set private member
    },
    'publ': function () {
        return this.pr + this.pu; //private and public members are accessible in public methods.
    },
    'o': function () {
        return 4;
    },
    'a': function () {
        return 'A.a';
    }
});

B = Private.class(A, { //extended from "A"
    'private init': function () {
        this.priv();
    },
    'private priv': function () { //methods don't override parent's private method with same name.
        this.pr = 'b'; //private member doesn't hide parent's private member with same name.
    },
    'publ': function () { //override A's publ method
        return this.pr + this.parent('publ'); //call parent's public method
    },
    'private o': function () { //calling "o" outside B's methods refers A.o
        return 5;
    },
    'oo': function () {
        return this.o(); //private "o" hides the parent's "o", but only in B's methods.
    },
    'private a': function () {
        return 'B.a';
    },
    'x': function () {
        return this.a();
    }
});

try {
    var x = new X(); //abstract class cannot be instantiated.
} catch (e) {
    console.log(e);
}

console.log(X.st); //15

var a = new A();
console.log(a.priv); //undefined
console.log(a.pr); //undefined
console.log(a.pu); //2
console.log(a.publ());//5
console.log(a.o());//4

var b = new B(1);
console.log(b.priv); //undefined
console.log(b.b); //undefined
console.log(b.pr); //undefined
console.log(b.pu); //2
console.log(b.publ());//b5
console.log(b.o());//4
console.log(b.oo());//5
console.log(b.a.origin === A); //true