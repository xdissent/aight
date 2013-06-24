!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, createEvent, registry) {
	WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
		var target = this;
 
		registry.unshift([target, type, listener, function (event) {
			event.currentTarget = target;
			event.preventDefault = function () { event.returnValue = false };
			event.stopPropagation = function () { event.cancelBubble = true };
			event.target = event.srcElement || target;
 
			listener.call(target, event);
		}]);
 
		this.attachEvent("on" + type, registry[0][3]);
	};
 
	WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
		for (var index = 0, register; register = registry[index]; ++index) {
			if (register[0] == this && register[1] == type && register[2] == listener) {
				return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
			}
		}
	};

	WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
		if (eventObject instanceof FakeEvent) eventObject = eventObject.createEvent();
		try {
			return this.fireEvent("on" + eventObject.type, eventObject);
		} catch (err) {
			for (var index = 0, register; register = registry[index]; ++index) {
				if (register[0] == this && register[1] == eventObject.type) {
					register[3].call(register[0], eventObject);
				}
			}
		}
	};

	WindowPrototype[createEvent] = DocumentPrototype[createEvent] = ElementPrototype[createEvent] = function (eventType) {
		return new FakeEvent(this, eventType);
	};

	function FakeEvent(doc, eventType) {
		this.doc = doc;
		this.eventType = eventType;
	}

	FakeEvent.ignore = ['doc', 'evtArgs', 'eventType', 'initEvent', 'createEvent'];

	FakeEvent.prototype.initEvent = function() {
		this.evtArgs = arguments;
	};

	FakeEvent.prototype.createEvent = function() {
		var evt = this.doc.createEventObject();
		for (var k in this) {
			if (FakeEvent.ignore.indexOf(k) < 0) {
				evt[k] = this[k];
			}
		}
		evt.type = this.evtArgs[0];
		return evt;
	};
	
})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", "createEvent", []);
