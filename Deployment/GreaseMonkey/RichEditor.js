// ==UserScript==
// @name        RichEditor Maximizer
// @namespace   Tfs
// @copyright  2013, Eimar Fandino
// @description Adding a maximize and minimze icon to the workitem
// @match       http://tfs.irdeto.intra:8080/*
// @version     2.0
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

// ========== DEFINING CONSTANTS ==========
var $ = unsafeWindow.jQuery;

$(window).load(function() {
    document.addEventListener("DOMNodeInserted", function(event) {
        if($(event.target).parent()[0].className == "richeditor-toolbar") {
            insertExpandIcon($(event.target).parent()[0]);
        }
    });
});

var widthContainer = 0, heightContainer = 0, topContainer = 0, leftContainer = 0;

function insertExpandIcon(toolbar) {
        var toolbar = $(toolbar);//convert to jQuery Element
        var isMaximized = false;
        if( toolbar.find(".maximizer").attr("class") != "maximizer richeditor-toolbar-group") {
            toolbar.append('<div class="maximizer richeditor-toolbar-group"><span class="richeditor-toolbar-button icon-tree-expand-all" title="Maximize" tabindex="0" unselectable="on"></span></div>');
            var maximizer = toolbar.find(".maximizer");
            maximizer.click(function() {
                if (isMaximized)  {
                    richeditor = maximizer.parents('.richeditor-container:first');
                    richeditor.width(widthContainer);
                    richeditor.height(heightContainer);
                    richeditor.css("top","0px");
                    richeditor.css("left","0px");
                    richeditor.css("position","relative");
                    isMaximized = false;
                    iconspan = maximizer.find('span');
                    iconspan.addClass("icon-tree-expand-all")
                    iconspan.removeClass("icon-tree-collapse-all");
                	richeditor.css("overflow","visible");
                	$(".ui-resizable-handle").css("display","block");
                    
                } else {
                    var documentWidth = $(document).width(); //retrieve current document width
                    var documentHeight = $(document).height(); //retrieve current document height
                    
                    richeditor = maximizer.parents('.richeditor-container:first');
                    widthContainer = richeditor.width();
                    heightContainer = richeditor.height();

                    richeditor.css("display","block");
                    richeditor.css("position","fixed");
                    richeditor.css("z-index","99999");
                    richeditor.css("background","white");
                    topContainer = richeditor.css("top");
                    leftContainer = richeditor.css("left");
                    
                    richeditor.css("top","10px");
                    richeditor.css("left","10px");
                    richeditor.width(documentWidth-50);
                    richeditor.height(documentHeight-50);
                    
                    //richeditor.height(documentHeight-50);
                    $(".ui-resizable-handle").css("display","none");
                    iconspan = maximizer.find('span');
                    iconspan.removeClass("icon-tree-expand-all")
                    iconspan.addClass("icon-tree-collapse-all");
                    richeditor.find(".richeditor-toolbar").css("display","block");
                    richeditor.find(".richeditor-toolbar").css("overflow","visible");
                    isMaximized = true;
                }
            });
        }
}