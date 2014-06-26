zoom-box.js

@@@@@@@@@@
How To Use
@@@@@@@@@@

Options:
   param : default value : all values

- 'boxWidth' : 'auto' : {number}, 'auto'
- 'boxHeight' : 'auto' : {number}, 'auto'
- 'boxLeft' : 'auto' : {number}, 'auto'
- 'boxTop' : 'auto' : {number}, 'auto'
- 'imageSource' : 'auto' : {string}
- 'appendBoxTo' : 'body' : {string}, {object}
- 'fitBoxTo' : window : {string}, {object}, false
- 'alignBoxTo' : window : {string}, {object}, false
- 'boxId' : '' : {string}
- 'boxClass' : '' : {string}
- 'position' : 'fixed' : {string} // recommended to be 'fixed' or 'absolute'
- 'closeText' : '' : {string}
- 'delegate' : '' : {string} // used for delegating the click object to sub items of the element with zoom box applied
- 'onUpdateScale' : '' : {function} // before the scale function is called, you can use this function to change the settings (width and height) manually when required.

View index.html for example code.


@@@@@@@@@@@@@
Things to Add
@@@@@@@@@@@@@

- create separate functionality for touch movement to be relative dragging rather than absolute.


@@@@@@@
Updates
@@@@@@@

=== v1-04 (stable) ===
- modified touch movement to be inverted like dragging (still 1:1 movement)

=== v1-03 (stable) ===
- changed the preload function to a load full image function
- scaling the zoom box now accepts floats rather than just integers
- added getInitialImage function
- added delegate property
- delayed move function event call when created

=== v1-02 (unstable) ===
- lots of changes to the scaling function
- decreased refresh rate time delay from 100 to 10
- fixed mobile platform performance
- added and changed event listeners
- added closeText property

=== v1-01 (unstable) ===
- several fixes to base functionality
- improvements to handling full page display

=== v1-00 (unstable) ===
- base functionality of zoom box