// ==UserScript==
// @name       TFS theme
// @namespace  TFS
// @version    0.0.1
// @description  Makes the TFs theme dark
// @match       http://tfs.irdeto.intra:8080/*
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setValue
// @copyright  2013, Eimar Fandino
// ==/UserScript==

// ========== DEFINING CONSTANTS ==========
var $ = unsafeWindow.jQuery;

$(window).load(function() 
 {
    function addCss(cssString) {
        var head = document.getElementsByTagName('head')[0];
        var newCss = document.createElement('style');
        newCss.type = "text/css";
        newCss.innerHTML = cssString;
        head.appendChild(newCss);
    }
    
    addCss ('* { background-color: #1E1E1E ! important; color:#ffffff !important}' );
});