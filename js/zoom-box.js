
(function($){

    var defaults = {
        renderContainer:false,
        renderOverImage:false,
        zoomSrc:'',
        close:''
    };

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
            var n_settings = $.extend({},defaults,settings);
            process($this,n_settings);
        }
    };

    function loadImage(controllers,settings)
    {
        var src = (controllers.zoomSrc) ? controllers.zoomSrc : controllers.originalSrc;

        if (src)
        {
            var nimg = new Image();
            nimg.src = src;

            setTimeout(function(){
                if (nimg.complete)
                {
                    controllers.naturalImgWidth = nimg.width;
                    controllers.naturalImgHeight = nimg.height;
                    controllers.$zoomboxImage.attr('src',src);
                    scale(controllers,settings);
                }
                else
                {
                    nimg.onload = function()
                    {
                        controllers.naturalImgWidth = this.width;
                        controllers.naturalImgHeight = this.height;
                        controllers.$zoomboxImage.attr('src',src);
                        scale(controllers,settings);
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

    function scale(controllers,settings)
    {
        var boxWidth = (settings.renderOverImage) ? controllers.$oimage.width() : '100%';
        var boxHeight = (settings.renderOverImage) ? controllers.$oimage.height() : '100%';

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

        var newOffset = controllers.$zoombox.offset();

        controllers.mouseX = newOffset.left + (controllers.$zoombox.width()/2);
        controllers.mouseY = newOffset.top + (controllers.$zoombox.height()/2);
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
        var speed = 0.2; // smaller=slower, larger=faster | min=0, max=1
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
        var originalImage = getOriginalImage(controllers.$oimage);
        controllers.originalSrc = originalImage.src;
        controllers.naturalImgWidth = originalImage.width;
        controllers.naturalImgHeight = originalImage.height;

        var close = (typeof settings.close == "string") ? settings.close : '';
        var html = '<div class="zoom-box-container"><a href="javascript:void(0);" class="zoom-box-close">'+close+'</a><img class="zoom-box-image" src="'+controllers.originalSrc+'" alt="" /></div>';
        
        controllers.$renderContainer = (!controllers.renderContainer || (typeof controllers.renderContainer == "object" && controllers.renderContainer != window)) ? controllers.renderContainer: $(controllers.renderContainer);

        if (!controllers.$renderContainer || !controllers.$renderContainer.length)
        {
            controllers.$renderContainer = controllers.$oimageContainer;
            settings.renderOverImage = true;
        }

        if (controllers.$renderContainer && controllers.$renderContainer.length)
        {
            if (controllers.$renderContainer.length > 1)
            {
                controllers.$renderContainer = controllers.$renderContainer.eq(0);
            }

            controllers.$oimage.before('<div class="zoom-box-mousetrap"></div>');

            if (settings.renderOverImage) controllers.$oimage.before(html);
            else controllers.$renderContainer.prepend(html);

            controllers.$mousetrap = controllers.$renderContainer.find('.zoom-box-mousetrap');
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
                'z-index':'89'
            });

            scale(controllers,settings);

            controllers.$zoombox.css({
                'visibility':'visible',
                'overflow':'hidden',
                'display':'none'
            }).fadeIn(400,function(){
                setTimeout(function(){controllers.moveready = true;},100);
            });

            //prevent img drag
            controllers.$zoomboxImage.on('dragstart',function(e){
                e.preventDefault();
            });

            controllers.$zoombox.on('mousemove',function(e){
                if (controllers.moveready)
                {
                    controllers.mouseX = e.pageX;
                    controllers.mouseY = e.pageY;
                    controllers.invert = false;
                    move(controllers,settings);
                }
            }).on('touchmove',function(e){
                e.preventDefault();
                if (controllers.moveready)
                {
                    controllers.mouseX = e.originalEvent.touches[0].pageX;
                    controllers.mouseY = e.originalEvent.touches[0].pageY;
                    controllers.invert = true;
                    move(controllers,settings);
                }
            }).on('mousedown',function(e){
                e.preventDefault();
                controllers.mouseDownX = e.pageX;
                controllers.mouseDownY = e.pageY;
            }).on('mouseup',function(e){
                e.preventDefault();
                var pr = 5; //click range pixels.
                if (e.pageX <= controllers.mouseDownX+pr && e.pageX >= controllers.mouseDownX-pr && e.pageY <= controllers.mouseDownY+pr && e.pageY >= controllers.mouseDownY-pr)
                {
                    remove(controllers,settings);
                }
                controllers.mouseDownX = -999;
                controllers.mouseDownY = -999;
            });

            controllers.$zoomboxClose.click(function(e){
                e.preventDefault();
                remove(controllers,settings);
            });

            loadImage(controllers,settings);

            controllers.isopen = true;
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
            controllers.isopen = false;

            controllers.$zoombox.fadeOut(400,function(){
                controllers.$zoombox.remove();
                controllers.$mousetrap.remove();

                if (controllers.animator.timer !== false)
                {
                    clearTimeout(controllers.animator.timer);
                    controllers.animator.timer = false;
                }

                controllers.$sobjects.attr('data-zbid','');
            });
        }
    }

    function process($objects,settings)
    {
        if ($objects.length > 0)
        {
            var valid = true;

            $objects.each(function(){
                if (getAttr($(this),'data-zbid')) valid = false;
            });

            if (valid)
            {
                var timeoutSpeed = Math.round(1000/33);
                newid++;
                zb[newid] = [];
                $objects.attr('data-zbid',newid);

                $objects.each(function(){
                    var $object = $(this);
                    var $imgs = $object;

                    if (!getAttr($object,'src'))
                    {
                        $imgs = $object.find('img');
                    }

                    $imgs.each(function(){

                        var $img = $(this);
                        var t_settings = $.extend({},settings);

                        applyDataSettings($img,t_settings);

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
                            zoomSrc:'',
                            renderOverImage:false,
                            isopen:false,
                            naturalImgWidth: 0,
                            naturalImgHeight: 0,
                            timeoutSpeed:timeoutSpeed,
                            mouseX:0,
                            mouseY:0,
                            mouseDownX: -999,
                            mouseDownY: -999,
                            invert:false,
                            moveready:false,
                            animator:{
                                timer:false,
                                startTime:0
                            }
                        };

                        create(controllers,t_settings);

                        zb[newid].push({controllers:controllers,settings:t_settings});

                    });

                });
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
