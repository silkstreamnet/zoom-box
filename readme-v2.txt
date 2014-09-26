zoom-box.js

@@@@@@@@@@
How To Use
@@@@@@@@@@

Options:
   param : default value : possible values
- 'renderContainer' : false : {jquery_object|string} // set a container for the zoom box to go in (internally defaults to the defined object for zoom box)
- 'renderOverImage' : true : {boolean} // set to false if the zoom is not being rendered over the top of the original image
- 'renderWidth' : false : {integer} // allows you to set the width of the zoom box container (useful when separate to the original image)
- 'renderHeight' : false : {integer} // allows you to set the height of the zoom box container (useful when separate to the original image)
- 'zoomSrc' : '' : {string} // the image source for the large image
- 'closeText' : '' : {string} // close button text, accepts html
- 'imageClickClose' : false : {boolean} // true or false whether clicking the image closes the zoom
- 'refreshRate' : 30 : {integer} // refresh rate or frames per second
- 'fadeDuration : 400 : {integer} // fade duration in milliseconds
- 'onRemove' : false : {function} // listener function
- 'afterRemove' : false : {function} // listener function
- 'onCreate' : false : {function} // listener function
- 'afterCreate' : false : {function} // listener function

You can apply data attribute settings to the main object and/or the image.

View index2.html for example code.


@@@@@@@@@@@@@
Things to Add
@@@@@@@@@@@@@

-


@@@@@@@
Updates
@@@@@@@

=== v2-01 (unstable) ===
- added touch smoothing

=== v2-00 (unstable) ===
- complete rework of core concepts
- now works just off of the parent/child relationship
- supports relative touch movement
