// ==UserScript==
// @name       SCR Quick View
// @namespace  TFS
// @version    0.0.2
// @description  Enable drag and drop in the workitems
// @match       http://tfs.irdeto.intra:8080(.*)/_workitems
// @match 		    http://tfs.irdeto.intra:8080/tfs/*/*/*/_workitems
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setValue
// @copyright  2013, Eimar Fandino
// @run-at document-end
// ==/UserScript==

// ========== DEFINING CONSTANTS ==========
var $ = unsafeWindow.jQuery;
var ICON_OFFSET = 70;
var URI = "";

$(window).load(function() 
 {
    var enabled = false;
    document.addEventListener("DOMNodeInserted", function(event) {
        if($(event.target).parent()[0].className.indexOf("grid-canvas") != -1) {
            menu_bar = $(".query-result-grid-toolbar").find(".menu-bar");
            last_col = menu_bar.find("li[title='Column Options']");
            if($("#quickView").attr("class") == null) {
                $('<li id="quickView" class="menu-item">Enable Quick View</li>').insertAfter(last_col);
                $('<li class="menu-item menu-item-separator disabled"><div class="separator"></div></li>').insertAfter(last_col);
                
                var json = jQuery.parseJSON( $(".tfs-context").html() );
                URI = json.navigation.collection.uri;
            }
        }
    });
    $("#quickView").live( "click", function() {
        if($(this).html() == "Enable Quick View") {
            $(this).text("Disable Quick View");
            enabled = true;
        }
        else {
            $(this).text("Enable Quick View");
            enabled = false;
        }
    });
    
    
    $( "#dialog" ).dialog({
        modal: true,
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        }
    });
    
    $( ".closeButton" ).live( "click", function() {
        $( "#dialog" ).fadeOut(300, function(){ $(this).remove();});
        $( "#overlay" ).fadeOut(300, function(){ $(this).remove();});
        $(this).remove();
    });


    $(".grid-row").live( "click", function() {
        if(enabled) {
            var scrid = $(this).children().first().attr("title");
            $.ajax({
                url: URI + '/_api/_wit/workitems?__v=3&ids=' + scrid,
                type: 'GET',  
                dataType: 'json',
                 xhrFields: {
                withCredentials: true
                },
                dataType: 'json',
                success: function(data, status) {
                    $.each(data.__wrappedArray, function (index, value) {
                        $.each(value, function (index, value) {
                            if(index == "fields") {
                                $.each(value, function (index, value) {    
                                    if(index == "10069") {
                                        var closebutton= '<div class="closeButton" style="cursor: pointer;cursor: hand;;z-index:999999"><span class="ui-icon ui-icon-closethick" style="z-index:999999">Close</span></div>';
                                        var popup = '<div id="overlay" style="position: fixed;top: 0;left: 0;height:100%;width: 100%;cursor: pointer;background: #000;background: rgba(0,0,0,0.75);z-index:999998"></div>';
                                        popup +=    '<div id="dialog" title="Basic dialog" class="ui-dialog ui-widget ui-widget-content ui-corner-all workitem-dialog ui-draggable ui-resizable" style="width:70%;height:50%;top:10%;left:10%;padding:50px;z-index:999999;overflow: scroll;">'
                                        popup +=    value
                                        popup +=    '</div>';
                                        $(".content-section").append(popup);
                                        $("#dialog").append(closebutton);
                                        $( "#dialog" ).dialog( "open" );
                                        $(".closeButton").css("position","fixed");
                                        $(".closeButton").css("top",$( "#dialog" ).position().top + ICON_OFFSET + 20);
                                        $(".closeButton").css("left",$( "#dialog" ).width() + $( "#dialog" ).position().left + ICON_OFFSET);
                                    }
                                });
                            }
                            
                        });
                    });
                }
           });
       }
   });
   
 });
 
