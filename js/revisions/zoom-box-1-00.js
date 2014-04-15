
(function($){

    var defaults = {
        boxWidth: 'auto',
        boxHeight: 'auto',
        boxLeft: 'auto',
        boxTop: 'auto',
        allowDrag: true,
        imageSource: 'auto', //uses the href if applied to an anchor / otherwise won't work.
        appendBoxTo: 'body', //can be string or object
        fitBoxTo: window,
        alignBoxTo: window,
        boxId: '',
        boxClass: '',
        position: 'absolute',
        onUpdateScale: false
    };

    var zb_s = [];

    $.fn.ZoomBox = function(settings)
    {
        var n_settings = $.extend({},defaults,settings);
        setup($(this),n_settings);
    };

    function preloadImage(image,settings) {
        settings.naturalImgWidth = 0;
        settings.naturalImgHeight = 0;

        var nimg = new Image();
        nimg.src = image;
        nimg.onload = function()
        {
            settings.naturalImgWidth = this.width;
            settings.naturalImgHeight = this.height;
        };
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
        if (typeof settings.onUpdateScale === "function") settings.onUpdateScale(settings);

        var _body = $('body');
        var defaultBodyOverflow = _body.css('overflow');
        if (settings.fitBoxTo == window) _body.css('overflow','hidden');
        
        objects.zbobj.css({
            'top':'0',
            'left':'0'
        });

        /*objects.zbimg.css({
            'top':'0',
            'left':'0'
        });*/

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
            else if (boxWidth.match(/[0-9]{1,2}%/))
            {
                objects.zbobj.css('width',boxWidth);
            }
            else
            {
                objects.zbobj.width(parseInt(boxWidth));
            }
        }

        if (boxHeight != 'not set')
        {
            if (boxHeight == 'auto')
            {
                boxHeight = (settings.fitBoxTo == window) ? objects.relativeFit.height() : objects.relativeFit.outerHeight(false);
                objects.zbobj.height(boxHeight);
            }
            else if (boxHeight.match(/[0-9]{1,2}%/))
            {
                objects.zbobj.css('height',boxHeight);
            }
            else
            {
                objects.zbobj.height(parseInt(boxHeight));
            }
        }

        var curOffset = objects.zbobj.offset();
        var relOffset = objects.relativeAlign.offset();

        if (boxLeft != 'not set')
        {
            if (boxLeft == 'auto')
            {
                if (settings.alignBoxTo == window)
                {
                    if (curOffset.left > 0)
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
            else if (boxLeft.match(/[0-9]{1,2}%/))
            {
                objects.zbobj.css('left',boxLeft);
            }
            else
            {
                objects.zbobj.css('left',parseInt(boxLeft)+'px');
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
                    if (curOffset.top > 0)
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
            else if (boxTop.match(/[0-9]{1,2}%/))
            {
                objects.zbobj.css('top',boxTop);
            }
            else
            {
                objects.zbobj.css('top',parseInt(boxTop)+'px');
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
                //if width has a larger distance to get to 1:1 then push size of image by the width.
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

        // center the image to the container and fit to height and width if too small.
        /*var centerx = (fitWidth-imgWidth)/2;
        var centery = (fitHeight-imgHeight)/2;

        objects.zbimg.css({
            'left':centerx+'px',
            'top':centery+'px'
        });*/

        if (settings.fitBoxTo == window) _body.css('overflow',defaultBodyOverflow);


        var newOffset = objects.zbobj.offset();

        settings.mouseX = newOffset.left + (objects.zbobj.width()/2);
        settings.mouseY = newOffset.top + (objects.zbobj.height()/2);
        move(objects,settings);

    }

    function animatePosition(objects, settings)
    {
        var invert = -1;
        var timeoutSpeed = Math.round(1000/60);

        var zbobj_width = objects.zbobj.width();
        var zbobj_height = objects.zbobj.height();
        var zbimg_width = objects.zbimg.width();
        var zbimg_height = objects.zbimg.height();
        var zbobj_offset = objects.zbobj.offset();
        var zbimg_offset = objects.zbimg.offset();

        var targetleft = Math.round(((((settings.mouseX-zbobj_offset.left)*invert)/(zbobj_width))*((zbimg_width-zbobj_width)))*100)/100;
        var targettop = Math.round(((((settings.mouseY-zbobj_offset.top)*invert)/(zbobj_height))*((zbimg_height-zbobj_height)))*100)/100;

        var curleft = Math.round(parseFloat(zbimg_offset.left-zbobj_offset.left)*100)/100;
        var curtop = Math.round(parseFloat(zbimg_offset.top-zbobj_offset.top)*100)/100;

        var newleft = curleft;
        var newtop = curtop;
        var speed = 0.1; // smaller=slower, larger=faster | min=0, max=1
        var tinyrange = 1;

        if (targetleft != curleft)
        {
            var newleft_diff = targetleft-curleft;
            var newleft_offset = (targetleft-curleft)*speed;
            if (newleft_diff < tinyrange && newleft_diff > -tinyrange) newleft_offset = newleft_diff;
            newleft = curleft+newleft_offset;
            objects.zbimg.css('left',newleft+'px');
        }

        if (targettop != curtop)
        {
            var newtop_diff = targettop-curtop;
            var newtop_offset = (targettop-curtop)*speed;
            if (newtop_diff < tinyrange && newtop_diff > -tinyrange) newtop_offset = newtop_diff;
            newtop = curtop+newtop_offset;
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

    function create(settings)
    {
        var zbid = settings.zbid;
        var imgsrc = settings.imageSource;
        var zbhtml = '<div class="zoom-box-container" data-zbid="'+zbid+'"><img src="'+imgsrc+'" alt="" /></div>';
        var objects = {
            relativeHolder: (typeof settings.appendBoxTo == "object" && settings.appendBoxTo != window) ? settings.appendBoxTo : $(settings.appendBoxTo), //required
            relativeFit: ((typeof settings.fitBoxTo == "object" && settings.fitBoxTo != window) || !settings.fitBoxTo) ? settings.fitBoxTo : $(settings.fitBoxTo),
            relativeAlign: ((typeof settings.alignBoxTo == "object" && settings.alignBoxTo != window) || !settings.alignBoxTo) ? settings.alignBoxTo : $(settings.alignBoxTo)
        };

        if (objects.relativeHolder.length && imgsrc && settings.naturalImgWidth != 0 && settings.naturalImgHeight != 0)
        {
            objects.relativeHolder = objects.relativeHolder.eq(0);
            objects.relativeHolder.append(zbhtml);

            objects.zbobj = objects.relativeHolder.find('.zoom-box-container[data-zbid="'+zbid+'"]');
            objects.zbimg = objects.zbobj.find('img');

            objects.zbobj.css({
                'position':settings.position,
                'z-index':'990',
                'visibility':'hidden'
            });

            objects.zbimg.css({
                'position':'absolute',
                'z-index':'991'
            });

            scale(objects,settings);

            objects.zbobj.css({
                'visibility':'visible',
                'overflow':'hidden',
                'display':'none'
            }).fadeIn(400);

            //prevent img drag
            objects.zbimg.on('dragstart',function(e){
                e.preventDefault();
            });

            objects.zbobj.on('mousemove',function(e){
                settings.mouseX = e.pageX;
                settings.mouseY = e.pageY;
                move(objects,settings);
            }).on('touchmove',function(e){
                settings.mouseX = e.originalEvent.touches[0].pageX;
                settings.mouseY = e.originalEvent.touches[0].pageY;
                move(objects,settings);
            }).click(function(e){
                e.preventDefault();
                settings.isopen = false;
                objects.zbobj.fadeOut(400,function(){
                    remove(objects,settings);
                });
            });

            zb_s[zbid-1].zbobjects = objects;
        }
    }

    function remove(objects,settings)
    {
        objects.zbobj.remove();
        objects = {};
        delete zb_s[settings.zbid-1].zbobjects;

        if (settings.animator.timer !== false)
        {
            clearTimeout(settings.animator.timer);
            settings.animator.timer = false;
        }
    }

    function setup(objects,settings)
    {
        if (objects.length > 0)
        {
            objects.each(function(){
                var object = $(this);
                var t_settings = $.extend({},settings);

                applyDataSettings(object,t_settings);
                t_settings.imageSource = (t_settings.imageSource == 'auto') ? getAttr(object,'href') : t_settings.imageSource;
                preloadImage(t_settings.imageSource,t_settings);
                new_zb(object,t_settings);

                t_settings.isopen = false;

                object.click(function(e){
                    e.preventDefault();
                    if (!t_settings.isopen)
                    {
                        create(t_settings);
                        t_settings.isopen = true;
                    }
                });
            });
        }
    }


    //screen checks
    var resizeCheck = false;
    $(window).resize(function(){
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
    $(window).scroll(function(){
        if (scrollCheck == false)
        {
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
            },100);
        }
    });


})(jQuery);
