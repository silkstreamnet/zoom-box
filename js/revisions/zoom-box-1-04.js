
(function($){

    var defaults = {
        boxWidth: 'auto',
        boxHeight: 'auto',
        boxLeft: 'auto',
        boxTop: 'auto',
        imageSource: 'auto', //uses the href if applied to an anchor / otherwise won't work.
        appendBoxTo: 'body', //can be string or object
        fitBoxTo: window,
        alignBoxTo: window,
        boxId: '',
        boxClass: '',
        position: 'fixed',
        closeText: '',
        delegate: '',
        onUpdateScale: false
    };

    var zb_s = [];

    $.fn.ZoomBox = function(settings)
    {
        settings = settings || {};
        var n_settings = $.extend({},defaults,settings);
        setup($(this),n_settings);
    };

    function loadImage(objects,settings) 
    {
        settings.naturalImgWidth = 0;
        settings.naturalImgHeight = 0;

        if (settings._imageSource)
        {
            var nimg = new Image();
            nimg.src = settings._imageSource;
            setTimeout(function(){
                if (nimg.complete)
                {
                    settings.naturalImgWidth = nimg.width;
                    settings.naturalImgHeight = nimg.height;
                    objects.zbimg.attr('src',settings._imageSource);
                    scale(objects,settings);
                }
                else
                {
                    nimg.onload = function()
                    {
                        settings.naturalImgWidth = this.width;
                        settings.naturalImgHeight = this.height;
                        objects.zbimg.attr('src',settings._imageSource);
                        scale(objects,settings);
                    };
                }

            },1);
        }
    }

    function getAttr(object,attr)
    {
        var rattr = object.attr(attr);
        return (typeof rattr == "undefined") ? '' : rattr;
    }

    function applyDataSettings(object,settings)
    {
        for (var p in defaults)
        {
            if (defaults.hasOwnProperty(p))
            {
                var attr = getAttr(object,'data-'+ p.toLowerCase());
                if (attr)
                {
                    settings[p] = attr;
                }
            }
        }
    }

    function new_zb(object,settings)
    {
        settings.zbid = zb_s.length+1;
        settings.animator = {
            timer: false,
            startTime: 0
        };
        zb_s.push({object:object,settings:settings});
    }

    function scale(objects,settings)
    {
        if (objects.zbobj)
        {
            if (typeof settings.onUpdateScale === "function") settings.onUpdateScale(settings);

            var _body = $('body');
            var hidescrollbars = false;
            if (settings.fitBoxTo == window && (settings.position = 'fixed' || _body.height() <= $(window).height()))
            {
                hidescrollbars = true;

                var old_body_width = _body.width();
                _body.css('overflow','hidden');
                var new_body_width = _body.width();

                if (new_body_width > old_body_width)
                {
                    var old_margin_right = parseInt(_body.css('margin-right'));
                    var new_margin_right = old_margin_right+(new_body_width-old_body_width);
                    _body.css('margin-right',new_margin_right+'px');
                }
            }

            objects.zbobj.css({
                'top':'0',
                'left':'0'
            });

            if (typeof settings.boxClass == "string" && settings.boxClass != '') objects.zbobj.addClass(settings.boxClass);
            if (typeof settings.boxId == "string" && settings.boxId != '') objects.zbobj.attr('id',settings.boxId);

            var boxWidth = settings.boxWidth;
            var boxHeight = settings.boxHeight;
            var boxLeft = settings.boxLeft;
            var boxTop = settings.boxTop;

            if (boxWidth != 'not set')
            {
                if (boxWidth == 'auto')
                {
                    boxWidth = (settings.fitBoxTo == window) ? objects.relativeFit.width() : objects.relativeFit.outerWidth(false);
                    objects.zbobj.width(boxWidth);
                }
                else if (typeof boxWidth == "string" && boxWidth.match(/[0-9]{1,2}%/))
                {
                    objects.zbobj.css('width',boxWidth);
                }
                else
                {
                    objects.zbobj.width(parseFloat(boxWidth));
                }
            }

            if (boxHeight != 'not set')
            {
                if (boxHeight == 'auto')
                {
                    boxHeight = (settings.fitBoxTo == window) ? objects.relativeFit.height() : objects.relativeFit.outerHeight(false);
                    objects.zbobj.height(boxHeight);
                }
                else if (typeof boxHeight == "string" && boxHeight.match(/[0-9]{1,2}%/))
                {
                    objects.zbobj.css('height',boxHeight);
                }
                else
                {
                    objects.zbobj.height(parseFloat(boxHeight));
                }
            }

            var curOffset = objects.zbobj.offset();
            var relOffset = (objects.relativeAlign) ? objects.relativeAlign.offset() : 0;

            if (boxLeft != 'not set')
            {
                if (boxLeft == 'auto')
                {
                    if (settings.alignBoxTo == window)
                    {
                        if (settings.position != 'fixed' && curOffset.left > 0)
                        {
                            boxLeft = -curOffset.left;
                        }
                        else
                        {
                            boxLeft = 0;
                        }
                    }
                    else
                    {
                        if (curOffset.left == relOffset.left)
                        {
                            boxLeft = 0;
                        }
                        else if (curOffset.left > relOffset.left)
                        {
                            boxLeft = 0-(curOffset.left-relOffset.left);
                        }
                        else //if (relOffset.left > curOffset.left)
                        {
                            boxLeft = relOffset.left-curOffset.left;
                        }
                    }

                    objects.zbobj.css('left',boxLeft+'px');
                }
                else if (typeof boxLeft == "string" && boxLeft.match(/[0-9]{1,2}%/))
                {
                    objects.zbobj.css('left',boxLeft);
                }
                else
                {
                    objects.zbobj.css('left',parseFloat(boxLeft)+'px');
                }
            }
            else
            {
                objects.zbobj.css('left','');
            }

            if (boxTop != 'not set')
            {
                if (boxTop == 'auto')
                {
                    if (settings.alignBoxTo == window)
                    {
                        if (settings.position != 'fixed' && curOffset.top > 0)
                        {
                            boxTop = -curOffset.top;
                        }
                        else
                        {
                            boxTop = 0;
                        }
                    }
                    else
                    {
                        if (curOffset.top == relOffset.top)
                        {
                            boxTop = 0;
                        }
                        else if (curOffset.top > relOffset.top)
                        {
                            boxTop = 0-(curOffset.top-relOffset.top);
                        }
                        else //if (relOffset.top > curOffset.top)
                        {
                            boxTop = relOffset.top-curOffset.top;
                        }
                    }

                    objects.zbobj.css('top',boxTop+'px');
                }
                else if (typeof boxTop == "string" && boxTop.match(/[0-9]{1,2}%/))
                {
                    objects.zbobj.css('top',boxTop);
                }
                else
                {
                    objects.zbobj.css('top',parseFloat(boxTop)+'px');
                }
            }
            else
            {
                objects.zbobj.css('top','');
            }

            var natImgWidth = settings.naturalImgWidth;
            var natImgHeight = settings.naturalImgHeight;
            var fitWidth = objects.zbobj.width();
            var fitHeight = objects.zbobj.height();

            // which dimension has the largest percentage difference.
            var percDiffWidth = natImgWidth / fitWidth; // 500 / 700
            var percDiffHeight = natImgHeight / fitHeight;

            var imgWidth = natImgWidth;
            var imgHeight = natImgHeight;

            if (percDiffHeight < 1 || percDiffWidth < 1)
            {
                if (percDiffWidth < percDiffHeight)
                {
                    imgWidth = fitWidth;
                    imgHeight *= (imgWidth/natImgWidth);
                }
                else
                {
                    imgHeight = fitHeight;
                    imgWidth *= (imgHeight/natImgHeight);
                }
            }

            objects.zbimg.width(imgWidth);
            objects.zbimg.height(imgHeight);

            if (hidescrollbars && settings.position != 'fixed') _body.css('overflow',settings.defaultBodyOverflow);

            var newOffset = objects.zbobj.offset();

            settings.mouseX = newOffset.left + (objects.zbobj.width()/2);
            settings.mouseY = newOffset.top + (objects.zbobj.height()/2);
            move(objects,settings);
        }
    }

    function animatePosition(objects, settings)
    {
        var timeoutSpeed = settings.timeoutSpeed;

        var zbobj_width = objects.zbobj.width();
        var zbobj_height = objects.zbobj.height();
        var zbimg_width = objects.zbimg.width();
        var zbimg_height = objects.zbimg.height();
        var zbobj_offset = objects.zbobj.offset();
        var zbimg_offset = objects.zbimg.offset();

        var targetleft = ((((settings.mouseX-zbobj_offset.left)*-1)/(zbobj_width))*((zbimg_width-zbobj_width)));
        var targettop = ((((settings.mouseY-zbobj_offset.top)*-1)/(zbobj_height))*((zbimg_height-zbobj_height)));

        if (settings.invert)
        {
            targetleft = ((zbimg_width-zbobj_width)*-1)+Math.abs(targetleft);
            targettop = ((zbimg_height-zbobj_height)*-1)+Math.abs(targettop);
        }

        var max_nwidth = (zbimg_width == zbobj_width) ? 0 : (zbimg_width-zbobj_width)*-1;
        if (targetleft >= 0) targetleft = 0;
        else if (targetleft < max_nwidth) targetleft = max_nwidth;

        var max_nheight = (zbimg_height == zbobj_height) ? 0 : (zbimg_height-zbobj_height)*-1;
        if (targettop >= 0) targettop = 0;
        else if (targettop < max_nheight) targettop = max_nheight;

        var curleft = parseFloat(zbimg_offset.left-zbobj_offset.left);
        var curtop = parseFloat(zbimg_offset.top-zbobj_offset.top);

        var newleft = curleft;
        var newtop = curtop;
        var speed = 0.2; // smaller=slower, larger=faster | min=0, max=1
        var tinyrange = 1;

        if (targetleft != curleft)
        {
            var newleft_diff = targetleft-curleft;
            var newleft_offset = (targetleft-curleft)*speed;
            if (newleft_diff < tinyrange && newleft_diff > -tinyrange) newleft_offset = newleft_diff;
            newleft = Math.floor((curleft+newleft_offset)*10)/10;
            objects.zbimg.css('left',newleft+'px');
        }

        if (targettop != curtop)
        {
            var newtop_diff = targettop-curtop;
            var newtop_offset = (targettop-curtop)*speed;
            if (newtop_diff < tinyrange && newtop_diff > -tinyrange) newtop_offset = newtop_diff;
            newtop = Math.floor((curtop+newtop_offset)*10)/10;
            objects.zbimg.css('top',newtop+'px');
        }

        if (settings.animator.timer !== false)
        {
            clearTimeout(settings.animator.timer);
            settings.animator.timer = false;
        }

        if (settings.animator.timer === false && (curleft != targetleft || curtop != targettop))
        {
            settings.animator.timer = setTimeout(function(){animatePosition(objects,settings);},timeoutSpeed);
        }
    }

    function move(objects,settings)
    {
        if (objects.zbobj && settings)
        {
            if (settings.animator.timer === false)
            {
                animatePosition(objects, settings);
            }
        }
    }

    function getInitialImage(clickobject)
    {
        //return src, width, height
        var data = {
            src: '',
            width: 0,
            height: 0
        };

        var img = clickobject;

        data.src = getAttr(img,'src');
        
        if (!data.src)
        {
            var imgs = clickobject.find('img');
            if (imgs.length > 0)
            {
                img = imgs.eq(0);
                data.src = getAttr(img,'src');
            }
        }

        if (data.src)
        {
            data.width = img.width();
            data.height = img.height();
        }

        return data;
    }

    function create(clickobject,settings)
    {
        var _body = $('body');
        settings.defaultBodyOverflow = _body.css('overflow');
        settings.defaultMarginRight = _body.css('margin-right');
        var zbid = settings.zbid;
        var initialImage = getInitialImage(clickobject);
        var imgsrc = initialImage.src;
        settings.naturalImgWidth = initialImage.width;
        settings.naturalImgHeight = initialImage.height;
        var closeText = (typeof settings.closeText == "string") ? settings.closeText : '';
        var zbhtml = '<div class="zoom-box-container" data-zbid="'+zbid+'"><a href="javascript:void(0);" class="zoom-box-close">'+closeText+'</a><img src="'+imgsrc+'" alt="" /></div>';
        var objects = {
            relativeHolder: (typeof settings.appendBoxTo == "object" && settings.appendBoxTo != window) ? settings.appendBoxTo : $(settings.appendBoxTo), //required
            relativeFit: ((typeof settings.fitBoxTo == "object" && settings.fitBoxTo != window) || !settings.fitBoxTo) ? settings.fitBoxTo : $(settings.fitBoxTo),
            relativeAlign: ((typeof settings.alignBoxTo == "object" && settings.alignBoxTo != window) || !settings.alignBoxTo) ? settings.alignBoxTo : $(settings.alignBoxTo)
        };

        if (objects.relativeHolder.length)
        {
            var moveready = false;

            objects.relativeHolder = objects.relativeHolder.eq(0);
            objects.relativeHolder.append(zbhtml);

            objects.zbobj = objects.relativeHolder.find('.zoom-box-container[data-zbid="'+zbid+'"]');
            objects.zbimg = objects.zbobj.find('img');
            objects.zbclose = objects.zbobj.find('a.zoom-box-close');

            objects.zbobj.css({
                'position':settings.position,
                'z-index':'990',
                'visibility':'hidden'
            });

            objects.zbimg.css({
                'position':'absolute',
                'z-index':'991',
                'max-width':'none',
                'max-height':'none'
            });

            objects.zbclose.css({
                'position':'absolute',
                'z-index':'992'
            });

            scale(objects,settings);

            objects.zbobj.css({
                'visibility':'visible',
                'overflow':'hidden',
                'display':'none'
            }).fadeIn(400,function(){
                setTimeout(function(){moveready = true;},100);
            });

            //prevent img drag
            objects.zbimg.on('dragstart',function(e){
                e.preventDefault();
            });

            objects.zbobj.on('mousemove',function(e){
                if (moveready)
                {
                    settings.mouseX = e.pageX;
                    settings.mouseY = e.pageY;
                    settings.invert = false;
                    move(objects,settings);
                }
            }).on('touchmove',function(e){
                e.preventDefault();
                if (moveready)
                {
                    settings.mouseX = e.originalEvent.touches[0].pageX;
                    settings.mouseY = e.originalEvent.touches[0].pageY;
                    settings.invert = true;
                    move(objects,settings);
                }
            }).on('mousedown',function(e){
                e.preventDefault();
                settings.mouseDownX = e.pageX;
                settings.mouseDownY = e.pageY;
            }).on('mouseup',function(e){
                e.preventDefault();
                var pr = 5; //click range pixels.
                if (e.pageX <= settings.mouseDownX+pr && e.pageX >= settings.mouseDownX-pr && e.pageY <= settings.mouseDownY+pr && e.pageY >= settings.mouseDownY-pr)
                {
                    remove(objects,settings);
                }
                settings.mouseDownX = -999;
                settings.mouseDownY = -999;
            });

            objects.zbclose.click(function(e){
                e.preventDefault();
                remove(objects,settings);
            });

            zb_s[zbid-1].zbobjects = objects;

            settings._imageSource = (settings.imageSource == 'auto') ? getAttr(clickobject,'href') : settings.imageSource;
            loadImage(objects,settings);

            settings.isopen = true;
        }
        else
        {
            settings.isopen = false;
        }
    }

    function remove(objects,settings)
    {
        if (settings.isopen)
        {
            objects.zbobj.fadeOut(400,function(){
                objects.zbobj.remove();
                objects = {};
                delete zb_s[settings.zbid-1].zbobjects;

                if (settings.animator.timer !== false)
                {
                    clearTimeout(settings.animator.timer);
                    settings.animator.timer = false;
                }

                $('body').css({
                    'overflow':settings.defaultBodyOverflow,
                    'margin-right':settings.defaultMarginRight
                });
            });
            settings.isopen = false;
        }
    }

    function setup(objects,settings)
    {
        if (objects.length > 0)
        {
            var _body = $('body');
            var defaultBodyOverflow = _body.css('overflow');
            var defaultMarginRight = _body.css('margin-right');
            var timeoutSpeed = Math.round(1000/30);

            objects.each(function(){
                var object = $(this);
                var delegate = (typeof settings.delegate == "string") ? settings.delegate : '';
                var t_settings = $.extend({},settings);

                applyDataSettings(object,t_settings);
                new_zb(object,t_settings);

                t_settings.isopen = false;
                t_settings.defaultBodyOverflow = defaultBodyOverflow;
                t_settings.defaultMarginRight = defaultMarginRight;
                t_settings.timeoutSpeed = timeoutSpeed;
                t_settings.mouseX = 0;
                t_settings.mouseY = 0;
                t_settings.mouseDownX = -999;
                t_settings.mouseDownY = -999;
                t_settings.invert = false;

                if (delegate)
                {
                    object.on('click',delegate,function(e){
                        e.preventDefault();
                        if (!t_settings.isopen) create($(this),t_settings);
                    });
                }
                else
                {
                    object.on('click',function(e){
                        e.preventDefault();
                        if (!t_settings.isopen) create($(this),t_settings);
                    });
                }
            });
        }
    }


    //screen checks
    var resizeCheck = false;
    $(window).on('resize.zoombox',function(){
        if (resizeCheck == false)
        {
            resizeCheck = true;
            setTimeout(function(){
                for (var i=0; i<zb_s.length; i++)
                {
                    if (typeof zb_s[i].zbobjects !== "undefined")
                    {
                        scale(zb_s[i].zbobjects,zb_s[i].settings);
                    }
                }
                resizeCheck = false;
            },100);
        }
    });

    var scrollCheck = false;
    $(window).on('scroll.zoombox',function(){
        if (scrollCheck == false)
        {
            for (var i=0; i<zb_s.length; i++)
            {
                if (typeof zb_s[i].zbobjects !== "undefined")
                {
                    scale(zb_s[i].zbobjects,zb_s[i].settings);
                }
            }
            scrollCheck = true;
            setTimeout(function(){
                for (var i=0; i<zb_s.length; i++)
                {
                    if (typeof zb_s[i].zbobjects !== "undefined")
                    {
                        scale(zb_s[i].zbobjects,zb_s[i].settings);
                    }
                }
                scrollCheck = false;
            },10);
        }
    });


})(jQuery);
