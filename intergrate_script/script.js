<div id="recommendations"></div>
<link rel="stylesheet" href="http://localhost:8000/static/dimadb/css/recommender.css">
<script src="http://localhost:8000/static/dimadb/js/recommender.js"></script>
<script>
      var evnts = ["click", "focus", "blur"];
      var currentUrl = window.location.href;
      var tmp = "";

      window.addEventListener('load', function () {showPopup_onscreen()})

      const func_debounce = debounce_leading(function(e) {
        tmp = currentUrl
        if (currentUrl != window.location.href) currentUrl = window.location.href
          
        var anchor = getParentAnchor(e.target),nextUrl = "";
        if(anchor !== null) nextUrl = anchor.href;
          
        capture_event(e,tmp,nextUrl);
      }, 200);
      
      for (var i = 0; i < evnts.length; i++) {
        document.addEventListener("" + evnts[i] + "", func_debounce);
      }
</script>