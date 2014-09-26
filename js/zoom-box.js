
(function($){

    //static private vars
    var MOUSE_LATENCY = 0.2;
    var TOUCH_LATENCY = 1;
    var TOUCH_END_LATENCY = 0.2;
    var DEFAULTS = {
        renderContainer:false,
        renderOverImage:true,
        renderWidth:false,
        renderHeight:false,
        zoomSrc:'',
        closeText:'',
        imageClickClose:false,
        refreshRate:30,
        fadeDuration:400,
        onRemove:false,
        afterRemove:false,
        onCreate:false,
        afterCreate:false
    };

    //dynamic private vars
    var newid = 0;
    var zb = [];

    $.fn.ZoomBox = function(settings)
    {
        settings = settings || {};
        var $this = $(this);

        if (typeof settings == "string")
        {
            var id = getAttr($this,'data-zbid');

            if (id && zb[id] && zb[id].length > 0)
            {
                for (var it=0; it<zb[id].length; it++)
                {
                    switch (settings)
                    {
                        default: break;

                        case 'remove':
                            remove(zb[id][it].controllers,zb[id][it].settings);
                            if (it == zb[id].length) delete zb[id];
                            break;
                    }
                }
            }
        }
        else
        {
            var n_settings = $.extend({},DEFAULTS,settings);
            process($this,n_settings);
        }
    };

    function loadImageReady(src,width,height,controllers,settings)
    {
        var zb_width = controllers.$zoombox.width();
        var zb_height = controllers.$zoombox.height();

        controllers.moveready = true;
        controllers.naturalImgWidth = width;
        controllers.naturalImgHeight = height;
        controllers.$zoomboxImage.attr('src',src);
        scale(controllers,settings);
        controllers.$zoomboxImage.css('left',((zb_width-controllers.$zoomboxImage.width())/2)+'px');
        controllers.$zoomboxImage.css('top',((zb_height-controllers.$zoomboxImage.height())/2)+'px');
        controllers.mouseX = zb_width/2;
        controllers.mouseY = zb_height/2;
        controllers.$zoombox.trigger('mousemove');
    }

    function loadImage(controllers,settings)
    {
        var src = (settings.zoomSrc) ? settings.zoomSrc : controllers.originalSrc;

        if (src)
        {
            var nimg = new Image();
            nimg.src = src;

            setTimeout(function(){
                if (nimg.complete)
                {
                    loadImageReady(src,nimg.width,nimg.height,controllers,settings);
                }
                else
                {
                    nimg.onload = function()
                    {
                        loadImageReady(src,this.width,this.height,controllers,settings);
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
        for (var p in DEFAULTS)
        {
            if (DEFAULTS.hasOwnProperty(p))
            {
                var attr = getAttr(object,'data-'+ p.toLowerCase());
                if (attr)
                {
                    settings[p] = (attr === "false") ? false : attr;
                }
            }
        }
    }

    function scale(controllers,settings)
    {
        var boxWidth = (settings.renderWidth !== false) ? settings.renderWidth : '100%';
        var boxHeight = (settings.renderHeight !== false) ? settings.renderHeight : '100%';

        if (settings.renderOverImage)
        {
            controllers.$mousetrap.css({'width':'100%','height':'100%'});
        }
        else
        {
            var oimage_width = controllers.$oimage.width();
            var oimage_height = controllers.$oimage.height();

            var parent_width = controllers.$oimage.parent().width();
            var parent_height = controllers.$oimage.parent().height();

            if (oimage_width < parent_width) controllers.$mousetrap.width(oimage_width);
            else controllers.$mousetrap.width(parent_width);

            if (oimage_height < parent_height) controllers.$mousetrap.height(oimage_height);
            else controllers.$mousetrap.height(parent_height);
        }


        if (typeof boxWidth == "string" && boxWidth.match(/[0-9]{1,3}%/))
        {
            controllers.$zoombox.css('width',boxWidth);
        }
        else if (typeof boxWidth == "number")
        {
            controllers.$zoombox.width(boxWidth);
        }

        if (typeof boxHeight == "string" && boxHeight.match(/[0-9]{1,3}%/))
        {
            controllers.$zoombox.css('height',boxHeight);
        }
        else if (typeof boxHeight == "number")
        {
            controllers.$zoombox.height(boxHeight);
        }

        var natImgWidth = controllers.naturalImgWidth;
        var natImgHeight = controllers.naturalImgHeight;
        var fitWidth = controllers.$zoombox.width();
        var fitHeight = controllers.$zoombox.height();

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

        controllers.$zoomboxImage.width(imgWidth);
        controllers.$zoomboxImage.height(imgHeight);

        move(controllers,settings);
    }

    function animatePosition(controllers, settings)
    {
        var timeoutSpeed = controllers.timeoutSpeed;

        var zbobj_width = controllers.$zoombox.width();
        var zbobj_height = controllers.$zoombox.height();
        var zbimg_width = controllers.$zoomboxImage.width();
        var zbimg_height = controllers.$zoomboxImage.height();
        var zbimg_offset = controllers.$zoomboxImage.position();

        var targetleft = ((((controllers.mouseX)*-1)/(zbobj_width))*((zbimg_width-zbobj_width)));
        var targettop = ((((controllers.mouseY)*-1)/(zbobj_height))*((zbimg_height-zbobj_height)));

        if (controllers.invert)
        {
            targetleft = ((zbimg_width-zbobj_width)*-1)+Math.abs(targetleft);
            targettop = ((zbimg_height-zbobj_height)*-1)+Math.abs(targettop);
        }

        var max_nwidth = (zbimg_width == zbobj_width) ? 0 : (zbimg_width-zbobj_width)*-1;
        if (targetleft > 0) targetleft = 0;
        else if (targetleft < max_nwidth) targetleft = max_nwidth;

        var max_nheight = (zbimg_height == zbobj_height) ? 0 : (zbimg_height-zbobj_height)*-1;
        if (targettop > 0) targettop = 0;
        else if (targettop < max_nheight) targettop = max_nheight;

        var curleft = parseFloat(zbimg_offset.left);
        var curtop = parseFloat(zbimg_offset.top);

        var newleft = curleft;
        var newtop = curtop;
        var speed = controllers.latency; // smaller=slower, larger=faster | min=0, max=1
        var tinyrange = 1;

        if (targetleft != curleft)
        {
            var newleft_diff = targetleft-curleft;
            var newleft_offset = (targetleft-curleft)*speed;
            if (newleft_diff < tinyrange && newleft_diff > -tinyrange) newleft_offset = newleft_diff;
            newleft = Math.floor((curleft+newleft_offset)*10)/10;
            controllers.$zoomboxImage.css('left',newleft+'px');
        }

        if (targettop != curtop)
        {
            var newtop_diff = targettop-curtop;
            var newtop_offset = (targettop-curtop)*speed;
            if (newtop_diff < tinyrange && newtop_diff > -tinyrange) newtop_offset = newtop_diff;
            newtop = Math.floor((curtop+newtop_offset)*10)/10;
            controllers.$zoomboxImage.css('top',newtop+'px');
        }

        if (controllers.animator.timer !== false)
        {
            clearTimeout(controllers.animator.timer);
            controllers.animator.timer = false;
        }

        if (controllers.animator.timer === false && (curleft != targetleft || curtop != targettop))
        {
            controllers.animator.timer = setTimeout(function(){animatePosition(controllers,settings);},timeoutSpeed);
        }
    }

    function move(controllers,settings)
    {
        if (controllers.animator.timer === false)
        {
            animatePosition(controllers, settings);
        }
    }

    function getOriginalImage($img)
    {
        //return src, width, height
        var data = {
            src: '',
            width: 0,
            height: 0
        };

        if ($img && $img.length)
        {
            data.src = getAttr($img,'src');

            if (data.src)
            {
                data.width = $img.width();
                data.height = $img.height();
            }
        }

        return data;
    }

    function create(controllers,settings)
    {
        if (typeof settings.onCreate === "function") settings.onCreate(settings);

        var originalImage = getOriginalImage(controllers.$oimage);
        controllers.originalSrc = originalImage.src;
        controllers.naturalImgWidth = originalImage.width;
        controllers.naturalImgHeight = originalImage.height;

        var closeText = (typeof settings.closeText == "string") ? settings.closeText : '';
        var html = '<div class="zoom-box-container"><img class="zoom-box-image" src="'+controllers.originalSrc+'" alt="" /></div><a href="javascript:void(0);" class="zoom-box-close">'+closeText+'</a>';
        var mt = '<div class="zoom-box-mousetrap"></div>';
        
        controllers.$renderContainer = (!settings.renderContainer || (typeof settings.renderContainer == "object" && settings.renderContainer != window)) ? settings.renderContainer: $(settings.renderContainer);

        if (!controllers.$renderContainer || !controllers.$renderContainer.length)
        {
            controllers.$renderContainer = controllers.$oimageContainer;
        }

        if (controllers.$renderContainer && controllers.$renderContainer.length)
        {
            if (controllers.$renderContainer.length > 1)
            {
                controllers.$renderContainer = controllers.$renderContainer.eq(0);
            }

            controllers.$renderContainer.prepend(html);

            if (settings.renderOverImage)
            {
                controllers.$renderContainer.prepend(mt);
                controllers.$mousetrap = controllers.$renderContainer.find('.zoom-box-mousetrap');
            }
            else
            {
                controllers.$oimage.before(mt);
                controllers.$mousetrap = controllers.$oimageContainer.find('.zoom-box-mousetrap');
            }

            controllers.$zoombox = controllers.$renderContainer.find('.zoom-box-container');
            controllers.$zoomboxImage = controllers.$zoombox.find('.zoom-box-image');
            controllers.$zoomboxClose = controllers.$zoombox.find('.zoom-box-close');

            controllers.$zoombox.css({
                'position':'absolute',
                'z-index':'90',
                'visibility':'hidden'
            });

            controllers.$zoomboxImage.css({
                'position':'absolute',
                'z-index':'91',
                'max-width':'none',
                'max-height':'none',
                'display':'block'
            });

            controllers.$zoomboxClose.css({
                'position':'absolute',
                'z-index':'92'
            });

            controllers.$mousetrap.css({
                'position':'absolute',
                'z-index':'93',
                'display':'block'
            });

            scale(controllers,settings);

            controllers.$zoombox.css({
                'visibility':'visible',
                'overflow':'hidden',
                'display':'none'
            }).fadeIn(settings.fadeDuration);

            //prevent img drag
            controllers.$zoomboxImage.on('dragstart',function(e){
                e.preventDefault();
            });

            controllers.$mousetrap.on('mousemove',function(e){
                if (controllers.moveready)
                {
                    controllers.invert = false;
                    controllers.latency = MOUSE_LATENCY;

                    var zoombox_offset = controllers.$zoombox.offset();
                    controllers.mouseX = e.pageX-zoombox_offset.left;
                    controllers.mouseY = e.pageY-zoombox_offset.top;

                    move(controllers,settings);
                }
            }).on('touchmove',function(e){
                e.preventDefault();
                if (controllers.moveready)
                {
                    controllers.invert = true;
                    controllers.latency = TOUCH_LATENCY;

                    var zoombox_offset = controllers.$zoombox.offset();
                    var touchX = e.originalEvent.touches[0].pageX-zoombox_offset.left;
                    var touchY = e.originalEvent.touches[0].pageY-zoombox_offset.top;

                    if (controllers.touchX >= 0 && controllers.touchY >= 0)
                    {
                        var maxX = controllers.$mousetrap.width();
                        var maxY = controllers.$mousetrap.height();

                        // new - old = diff
                        controllers.touchDiffX = touchX-controllers.touchX;
                        controllers.touchDiffY = touchY-controllers.touchY;
                        controllers.mouseX += controllers.touchDiffX;
                        controllers.mouseY += controllers.touchDiffY;

                        if (controllers.mouseX > maxX) controllers.mouseX = maxX;
                        else if (controllers.mouseX < 0) controllers.mouseX = 0;
                        if (controllers.mouseY > maxY) controllers.mouseY = maxY;
                        else if (controllers.mouseY < 0) controllers.mouseY = 0;

                        move(controllers,settings);
                    }

                    controllers.touchX = touchX;
                    controllers.touchY = touchY;
                }
            }).on('mousedown',function(e){
                e.preventDefault();
                var zoombox_offset = controllers.$zoombox.offset();
                controllers.mouseDownX = e.pageX-zoombox_offset.left;
                controllers.mouseDownY = e.pageY-zoombox_offset.top;
            }).on('mouseup',function(e){
                e.preventDefault();
                if (settings.imageClickClose)
                {
                    var pr = 5;
                    var zoombox_offset = controllers.$zoombox.offset();
                    if (e.pageX-zoombox_offset.left <= controllers.mouseDownX+pr && e.pageX-zoombox_offset.left >= controllers.mouseDownX-pr && e.pageY-zoombox_offset.top <= controllers.mouseDownY+pr && e.pageY-zoombox_offset.top >= controllers.mouseDownY-pr)
                    {
                        remove(controllers,settings);
                    }
                }
                controllers.mouseDownX = -999;
                controllers.mouseDownY = -999;
            }).on('touchend',function(e){
                controllers.invert = true;
                controllers.latency = TOUCH_END_LATENCY;

                if (controllers.touchX >= 0 && controllers.touchY >= 0)
                {
                    var maxX = controllers.$mousetrap.width();
                    var maxY = controllers.$mousetrap.height();

                    // new - old = diff
                    controllers.mouseX += controllers.touchDiffX;
                    controllers.mouseY += controllers.touchDiffY;

                    if (controllers.mouseX > maxX) controllers.mouseX = maxX;
                    else if (controllers.mouseX < 0) controllers.mouseX = 0;
                    if (controllers.mouseY > maxY) controllers.mouseY = maxY;
                    else if (controllers.mouseY < 0) controllers.mouseY = 0;

                    move(controllers,settings);
                }

                controllers.touchX = -999;
                controllers.touchY = -999;
            });

            controllers.$zoomboxClose.click(function(e){
                e.preventDefault();
                remove(controllers,settings);
            });

            loadImage(controllers,settings);

            controllers.isopen = true;

            if (typeof settings.afterCreate === "function") settings.afterCreate(settings);
        }
        else
        {
            controllers.isopen = false;
        }
    }

    function remove(controllers,settings)
    {
        if (controllers.isopen)
        {
            if (typeof settings.onRemove === "function") settings.onRemove(settings);

            controllers.isopen = false;

            controllers.$zoombox.fadeOut(settings.fadeDuration,function(){
                controllers.$zoombox.remove();
                controllers.$mousetrap.remove();

                if (controllers.animator.timer !== false)
                {
                    clearTimeout(controllers.animator.timer);
                    controllers.animator.timer = false;
                }

                controllers.$sobjects.attr('data-zbid','');

                if (typeof settings.afterRemove === "function") settings.afterRemove(settings);
            });
        }
    }

    function process($objects,settings)
    {
        if ($objects.length > 0)
        {
            var existing_id = -1;

            $objects.each(function(){
                var eid = getAttr($(this),'data-zbid');
                if (eid !== '') existing_id = parseInt(eid);
            });

            if (existing_id >= 0 && zb[existing_id] && zb[existing_id].length > 0)
            {
                for (var j=0; j<zb[existing_id].length; j++)
                {
                    if (!zb[existing_id][j].controllers.isopen)
                    {
                        zb[existing_id][j].controllers.$zoombox.stop(true,false).fadeTo(settings.fadeDuration,1);
                        zb[existing_id][j].controllers.isopen = true;
                    }
                }
            }
            else
            {
                var timeoutSpeed = Math.round(1000/settings.refreshRate);
                newid++;
                zb[newid] = [];
                $objects.attr('data-zbid',newid);

                $objects.each(function(){
                    var $object = $(this);
                    var t_settings = $.extend({},settings);
                    applyDataSettings($object,t_settings);

                    var $imgs = $object;

                    if (!getAttr($object,'src'))
                    {
                        $imgs = $object.find('img');
                    }

                    $imgs.each(function(){

                        var $img = $(this);
                        var q_settings = $.extend({},t_settings);
                        applyDataSettings($img,q_settings);

                        var controllers = {
                            id:newid,
                            $sobjects:$objects,
                            $oimage:$img,
                            $oimageContainer:$img.parent(),
                            $renderContainer:false,
                            $zoombox:false,
                            $zoomboxImage:false,
                            $zoomboxClose:false,
                            $mousetrap:false,
                            originalSrc:'',
                            renderOverImage:false,
                            isopen:false,
                            naturalImgWidth: 0,
                            naturalImgHeight: 0,
                            timeoutSpeed:timeoutSpeed,
                            mouseX:0,
                            mouseY:0,
                            mouseDownX: -999,
                            mouseDownY: -999,
                            touchX:-999,
                            touchY:-999,
                            touchDiffX:0,
                            touchDiffY:0,
                            invert:false,
                            moveready:false,
                            latency:0.2,
                            animator:{
                                timer:false,
                                startTime:0
                            }
                        };

                        create(controllers,q_settings);

                        zb[newid].push({controllers:controllers,settings:q_settings});

                    });

                });
            }
        }
    }

    function scaleAll()
    {
        for (var i in zb)
        {
            if (zb.hasOwnProperty(i))
            {
                if (zb[i] && zb[i].length)
                {
                    for (var j=0; j<zb[i].length; j++)
                    {
                        scale(zb[i][j].controllers,zb[i][j].settings);
                    }
                }
            }
        }
    }

    //screen checks
    var resizeCheck = false;
    $(window).on('resize.zoombox',function(){
        if (resizeCheck == false)
        {
            resizeCheck = true;
            setTimeout(function(){
                scaleAll();
                resizeCheck = false;
            },100);
        }
    });

    var scrollCheck = false;
    $(window).on('scroll.zoombox',function(){
        if (scrollCheck == false)
        {
            scaleAll();
            scrollCheck = true;
            setTimeout(function(){
                scaleAll();
                scrollCheck = false;
            },10);
        }
    });


})(jQuery);
