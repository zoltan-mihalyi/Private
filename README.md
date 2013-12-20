Private
=======

Private: simple class and inheritance system, with easy private member and method support!

- Private members
- Private methods
- Abstract methods
- Final methods
- Lots of fun

How does it work?
-----------------

The main problem is to hide private members and methods. We use prototype chain to achieve this. If the private methods
and members are "lower" in the prototype chain, we can't access them through a reference of "new A()" but a private
method can see the public and private methods and members too.
But how can the public methods access the private methods and members, like getters and setters? The key is the using of
proxy methods. The object's prototype contains the proxy methods, which call the original methods with the private
object as context, so each method can work with the private data, even the public ones.


```

                +---------+
                I Public  I Same for each object
                I proxy   I -----+
                I methods I      I
                +----^----+      I
                     I           I
           __proto__ I           I
                     I           I
                +----+----+      I
new A() ------> I Public  I      I
                I members I      I
                +----^----+      I
                     I           I
           __proto__ I           I
                     I           I
                +----+----+      I
                I Private I      I
                I members,I <----+ original methods are called with this context
                I methods I
                +---------+

```