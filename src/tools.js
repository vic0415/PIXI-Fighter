"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UpdateListener = /** @class */ (function () {
    function UpdateListener() {
        this.observers = [];
        this.observers.length = 0;
    }
    UpdateListener.prototype.subscribe = function (observer) {
        this.observers.push(observer);
    };
    UpdateListener.prototype.unsubscribe = function (unsubscribe) {
        this.observers = this.observers.filter(function (observer) {
            if (observer === unsubscribe) {
                return false;
            }
            else {
                return true;
            }
        });
    };
    UpdateListener.prototype.broadcast = function (delta) {
        this.observers.forEach(function (observer) { return observer.update(delta); });
    };
    UpdateListener.prototype.clear = function () {
        this.observers.length = 0;
    };
    return UpdateListener;
}());
exports.UpdateListener = UpdateListener;
