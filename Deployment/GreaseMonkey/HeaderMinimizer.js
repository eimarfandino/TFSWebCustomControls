// ==UserScript==
// @name       Header Minimizer
// @description  Adds a toggle instead off TFS logo that hides some toolbars
// @match       http://tfs.irdeto.intra:8080/*
// @version     2.0
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setValue
// @copyright  2013, Eimar Fandino
// @run-at document-end
// ==/UserScript==

// ========== DEFINING CONSTANTS ==========
var $ = unsafeWindow.jQuery;

$(window).load(function() {
    var w;
    if (typeof unsafeWindow != undefined) {
        w = unsafeWindow
    } else {
        w = window;
    }
    if (w.self != w.top) {
        return;
    }
    $(".logo").hide();
    $(".search-box").appendTo("#header-row").css("margin-top","5px");
    
    var UNDISTRACT = localStorage.getItem("undistract");
    
    if (UNDISTRACT =="true"){
        undistract();
    } else {
        redistract();
    }
    
    function undistract() {
        
        $(".content-section").animate({top: 31});
        $(".right-hub-content").animate({top: 10});
        $(".tfs-tags").slideUp();
        $(".hub-title").hide();
        $("span.slash").first().text("▶");
        localStorage.setItem("undistract", "true");
    }
    
    function redistract() {
        $(".content-section").animate({top: 91});
        $(".right-hub-content").animate({top: 45});
        $(".tfs-tags").slideDown();
        $(".hub-title").show();
        $("span.slash").first().text("▼");
        localStorage.setItem("undistract", "false");
    }
    
    $("span.slash").click(function(){
        
        var UNDISTRACT = localStorage.getItem("undistract");
        if ($("span.slash").text() == "▼/"){
            undistract();
        } else {
            redistract();
        }
    })
});
