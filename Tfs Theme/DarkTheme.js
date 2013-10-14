TFS.module("TaskboardEnhancer",
    [
        "TFS.WorkItemTracking.Controls",
        "TFS.WorkItemTracking",
        "TFS.Core"
    ],
    function () {
        // custom control implementation
    }
);

TFS.module("TaskboardEnhancer",[],function(){  });

var $ = unsafeWindow.jQuery;

$(function() { 
 {
    function addCss(cssString) {
        var head = document.getElementsByTagName('head')[0];
        var newCss = document.createElement('style');
        newCss.type = "text/css";
        newCss.innerHTML = cssString;
        head.appendChild(newCss);
    }
    
    addCss ('div, label { background-color: #1E1E1E ! important; color:#ffffff !important}' );
});
