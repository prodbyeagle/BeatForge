var modal = document.getElementById('modal');
var isScrolling = false;
var startY;
var startScrollTop;

modal.addEventListener('mousedown', function (e) {
   isScrolling = true;
   startY = e.pageY;
   startScrollTop = modal.scrollTop;
});

modal.addEventListener('mousemove', function (e) {
   if (!isScrolling) return;
   var delta = startY - e.pageY;
   modal.scrollTop = startScrollTop + delta;
});

modal.addEventListener('mouseup', function () {
   isScrolling = false;
});

modal.addEventListener('mouseleave', function () {
   isScrolling = false;
});