(function($){

    // setup vars
    var _private = function(){},
        _static = {
            $window:$(window),
            $html:$('html'),
            $body:$('body'),
            _event_namespace:'Zoombox',
            _next_instance_id:0,
            _instances:{length:0}
        };

    // static functions
    _static.param = function(parameter,_default) {
        return (typeof parameter !== 'undefined' ? parameter : _default);
    };

    // private functions
    _private.prototype.reset = function() {
        var self = this.self;

        self.trigger('reset');

        self.properties = {
            is_started:false,
            is_loading:false,
            instance_id:self.properties.instance_id,
            events:self.properties.events,
            cache:{
                images:{},
                interface_images_pending:0,
                content_images_pending:0,
                window_width:-1
            }
        };
        self.elements = {
            $zoombox:null,
            $zoombox_content:null,
            $zoombox_close:null,
            $zoombox_loading:null
        };

        self.trigger('after_reset');
    };

    _private.prototype.applySettings = function(){
        var self = this.self;

        var window_width = _static.$window.width(),
            responsive_width_keys = [],
            new_settings = $.extend(true, {}, self.base_settings);

        if (window_width !== self.properties.cache.window_width) {
            if (typeof self.base_settings.responsive === "object") {
                for (var responsive_key in self.base_settings.responsive) {
                    if (self.base_settings.responsive.hasOwnProperty(responsive_key)) {
                        responsive_width_keys.push(responsive_key);
                    }
                }
            }

            if (responsive_width_keys.length) {
                responsive_width_keys.sort(function (a, b) {
                    return a - b
                });

                for (var i = responsive_width_keys.length; i >= 0; i--) {
                    if (window_width > parseInt(responsive_width_keys[i], 10)) {
                        $.extend(true, new_settings, self.base_settings.responsive[responsive_width_keys[i]]);
                        break;
                    }
                }

                self.settings = new_settings;
                self._private.applyDomSettings();
            } else {
                self.settings = new_settings;
            }

            self.properties.cache.window_width = window_width;
        } else {
            self.settings = new_settings;
        }
    };

    _private.prototype.applyDomSettings = function(){
        var self = this.self;
        if (self.isCreated()) {
            self.trigger('update_dom');



            self.trigger('after_update_dom');
        }
    };

    //
    var Zoombox = function(settings) {
        var self = this;

        self._private = new _private();
        self._private.self = self;

        self.base_settings = $.extend(true,{},self.default_settings,_static.param(settings,{}));

        self.properties = {
            instance_id:_static._next_instance_id,
            events:{},
            cache:{}
        };
        self.elements = {

        };

        self._private.reset();
        self._private.applySettings();

        _static._next_instance_id++;

        self.trigger('after_initialize',false,[settings]);
    };

    Zoombox.prototype.version = '3.0.0';
    Zoombox.prototype.default_settings = {
        animation:'fade', // zoom or fade
        container:false,
        close_text:'',
        responsive:{}
    };
    Zoombox.prototype._static = _static;

    Zoombox.prototype.create = function() {

    };

    Zoombox.prototype.destroy = function() {

    };

    Zoombox.prototype.update = function() {

    };

    Zoombox.prototype.start = function() {

    };

    Zoombox.prototype.stop = function() {

    };

    Zoombox.prototype.adjust = function() {

    };

    Zoombox.prototype.isCreated = function(){
        var self = this;
        return !!self.elements.$zoombox;
    };

    Zoombox.prototype.isLoading = function(){
        var self = this;
        return self.properties.is_loading;
    };

    Zoombox.prototype.isStarted = function(){
        var self = this;
        return self.properties.is_started;
    };

    Zoombox.prototype.on = function(event,handler){
        var self = this;
        var event_parts = event.split('.',2);
        if (event_parts.length) {
            var event_type = event_parts[0], event_name = (event_parts[1]) ? event_parts[1] : '_default';
            if (!_static.isPlainObject(self.properties.events[event_type])) self.properties.events[event_type] = {};
            if (!_static.isArray(self.properties.events[event_type][event_name])) self.properties.events[event_type][event_name] = [];
            self.properties.events[event_type][event_name].push(handler);
        }
    };

    Zoombox.prototype.off = function(event,handler){
        var self = this;
        var event_parts = event.split('.',2);
        if (event_parts.length) {
            var event_type = event_parts[0], event_name = (event_parts[1]) ? event_parts[1] : false;
            if (_static.isPlainObject(self.properties.events[event_type])) {
                for (var current_event_name in self.properties.events[event_type]) {
                    if (self.properties.events[event_type].hasOwnProperty(current_event_name)
                        && _static.isArray(self.properties.events[event_type][current_event_name])
                        && (event_name === false || event_name === current_event_name)) {
                        if (_static.isFunction(handler)) {
                            for (var i=0; i<self.properties.events[event_type][current_event_name].length; i++) {
                                if (self.properties.events[event_type][current_event_name][i] === handler) {
                                    self.properties.events[event_type][current_event_name].splice(i,1);
                                    i--;
                                }
                            }
                        }
                        else self.properties.events[event_type][current_event_name] = [];
                    }
                }
            }
        }
    };

    Zoombox.prototype.trigger = function(event,handler,params){
        var self = this;
        params = (_static.isArray(params)) ? params : [];
        var event_parts = event.split('.',2);
        if (event_parts.length) {
            var event_type = event_parts[0], event_name = (event_parts[1]) ? event_parts[1] : false;
            if (_static.isFunction(self.settings[event_type])) {
                self.settings[event_type]();
            }
            if (_static.isPlainObject(self.properties.events[event_type])) {
                for (var current_event_name in self.properties.events[event_type]) {
                    if (self.properties.events[event_type].hasOwnProperty(current_event_name)
                        && _static.isArray(self.properties.events[event_type][current_event_name])
                        && (event_name === false || event_name === current_event_name)) {
                        for (var i=0; i<self.properties.events[event_type][current_event_name].length; i++) {
                            if (_static.isFunction(self.properties.events[event_type][current_event_name][i])
                                && (!_static.isFunction(handler) || self.properties.events[event_type][current_event_name][i] === handler)) {
                                self.properties.events[event_type][current_event_name][i].apply(self,params);
                            }
                        }
                    }
                }
            }
        }
    };

    // global events
    _static.$window.on('resize.'+_static._event_namespace,function(){
        if (_static._instances.length > 0) {
            for (var i in _static._instances) {
                if (_static._instances.hasOwnProperty(i)) {
                    if (_static._instances[i] instanceof Zoombox) {
                        _static._instances[i]._private.applySettings();
                        if (_static._instances[i].isStarted()) {
                            _static._instances[i].adjust(false);
                        }
                    }
                }
            }
        }
    });

    $.Zoombox = Zoombox;

})(jQuery);