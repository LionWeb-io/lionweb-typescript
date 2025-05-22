# Changelog

## 0.7.0

* Replace util functions with ones from `ts-utils`.
* Add a method `tryFromId` to the `IdMapping` class that returns `undefined` on an unknown ID, rather than throwing an error.


## 0.6.13

* Add a getter `referenceTargets` to `INodeBase` that – like the `children` getter for containments – returns an array of all nodes targeted by reference features (direct and inherited) of the classifier of the node.
    *Note* that these getters are (in principle) meant *for internal use only*!

