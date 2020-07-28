let selectedKeyword = -1;
let currentEditingNote = "";
let currentNoteIsNew = true;
let currentTime = "";
let currentEditingNav;
let bgbox = $('#background');
let Bing_URL;
let currentSearchEngine = 'google';

function Get_Bing() { //bing壁纸获取
    $.get('https://jsonp.afeld.me/?url=http%3A%2F%2Fcn.bing.com%2FHPImageArchive.aspx%3Fformat%3Djs%26idx%3D0%26n%3D1').then(function (data) { 
        bgbox.css('background-image', "url(" + "https://cn.bing.com/" + data.images[0]['url'] + ")");
    });
}
function displayTime() {
    date = new Date();
    hour = date.getHours();
    if (date.getMinutes() < 10) {
        minute = "0" + date.getMinutes();
    } else {
        minute = date.getMinutes();
    }
    document.getElementById("time").innerHTML = hour + ":" + minute;
}
function Inputfocus() {
    $('#input0').attr("placeholder", "");
    $('#input0').attr("class", "input_focus");
    $('#background').attr("class", "background_max");
    $('.searchOptBox').fadeIn("slow", function () {
        $('.searchOptBox').attr("id", "searchOptBox_show")
    })
    if ($('.quotebox').css('opacity') == '0') {
        showquote();
    }
}

function Inputblur() {
    if (true) {
        $('#input0').attr("value", "");
        $("#input0").val("");
    }
    $('#input0').attr("placeholder", "Search");
    $('#input0').attr("class", "input");
    $('#background').attr("class", "background_min");
    $('.searchOptBox').attr("id", "searchOptBox_hidden");
    $('.keyword').attr('id', 'keyword_none');
    if ($('.quotebox').css('opacity') == '1') {
        hidequote();
    }
}
$('.container').click(function (e) {
    hiddenpage2();
    Inputblur();
    if (menuSearch.style.opacity === "1") {
        hideMenu(menuSearch);
    }
});
$('#input0').click(function (e) {
    Inputfocus();
    e.stopPropagation();
    e.preventDefault();
});

function search() {
    
    var input0 = $('#input0')
    const str = input0.val();
    const finalStr = str.replace("翻译：", "");
    let url;
    if (/^[a-z]+:\/\/[a-z0-9_\-\/.#?=%]+$/i.test(str)) {
        open(str);
        Inputblur();
        return false;
    } else if (str.indexOf("翻译：") != -1) {
        url = "https://fanyi.baidu.com/#en/zh/" + finalStr;
    } else {
        
        switch (currentSearchEngine) {
            case 'baidu':
                url = "https://www.baidu.com/s?word=" + encodeURIComponent(str);
                break;
            case 'bing':
                url = "https://cn.bing.com/search?q=" + encodeURIComponent(str);
                break;
            case 'google':
                url = "https://www.google.com/search?q=" + encodeURIComponent(str);
                break;
        }
    }
    if (true) {//是否新标签页打开
        open(url);
    } else {
        location.href = url;
    }
    setTimeout(() => Inputblur(), 50);
}
function switchSearchEng(searchEng) {
    switch (searchEng) {
        case 'baidu':
            currentSearchEngine = "baidu";
            searchOpt1.classList.add("selected");
            searchOpt2.classList.remove("selected");
            searchOpt3.classList.remove("selected");
            break;
        case 'bing':

            currentSearchEngine = "bing";
            searchOpt2.classList.add("selected");
            searchOpt1.classList.remove("selected");
            searchOpt3.classList.remove("selected");
            break;
        case 'google':

            currentSearchEngine = "google";
            searchOpt3.classList.add("selected");
            searchOpt1.classList.remove("selected");
            searchOpt2.classList.remove("selected");
            break;
    }

}
$('#searchOpt1').click(function (e) {
    switchSearchEng('baidu');
    $('#input0').focus();
    e.stopPropagation();
    e.preventDefault();
});
$('#searchOpt2').click(function (e) {
    switchSearchEng('bing');
    $('#input0').focus();
    e.stopPropagation();
    e.preventDefault();
});
$('#searchOpt3').click(function (e) {
    switchSearchEng('google');
    $('#input0').focus();
    e.stopPropagation();
    e.preventDefault();
});
$('#input0').keydown(function (event) {
    switch (event.keyCode) {
        case 13:
            search();
            return false;
        case 38:
            selectKeyword(-1);
            return false;
        case 40:
            selectKeyword(+1);
            return false;
    }
})
var searchResult = $('.keyword')
var searchInput = $('#input0')
var timer = null;
function clearContent() {
    var size = searchResult.children('div').length;
    if (size > 0) {
        searchResult.empty('div')
    }
};

function handletranslation(res){
    var span = $("<span><span>");
    span.text(res['translateResult'][0][0]['tgt']);
    $('div[name="transform"]').text("翻译：" + $('#input0').val()).append(span);
}





function handleSuggestion(res) {
    var result = res['s'];
    // 判断第一个结果是不是空，修复空输入提示问题
    if (res[0] != "") {
        // 截取前7个搜索建议项
        if (result.length >= 7) {
            result = result.slice(0, 8)
        }
        for (let i = 0; i < result.length; i++) {
            // 动态创建div标签
            var divObj = $("<div id='key'></div>");
            divObj.click(function () {
                jumpPage(this);
            })
            divObj.text(result[i].replace("\"", '').replace("\"", ""));
            searchResult.append(divObj);
        }
    }
}
searchInput.bind('input propertychange', function (e) {
    $('.keyword').fadeIn(function () {
        $('.keyword').attr('id', 'keyword_show');
    });
    // 如果输入框内容为空 清除内容且无需跨域请求
    if ($('#input0').val().length === 0) {
        clearContent();
        $('.keyword').attr('id', 'keyword_none');
        return;
    }
    clearContent();
    var divObj = $("<div id='key' name='transform' ></div>");
    divObj.click(function (e) {
        jumpPage(this);
    })
    divObj.text("翻译：" + $('#input0').val());
    searchResult.append(divObj);
    var Input = document.getElementById('input0')
    if (Input.timer) {
        clearTimeout(Input.timer);
    }
    if (e.keyCode !== 40 && e.keyCode !== 38) {
        // 函数节流优化 
        Input.timer = setTimeout(() => {
            // 创建script标签JSONP跨域
            var script = document.createElement("script");
            script.src = "https://www.baidu.com/su?&wd=" + encodeURI(this.value.trim()) +
                "&p=3&cb=handleSuggestion";
            var Container = document.getElementById('container');
            Container.appendChild(script);
        }, 260)
    }
});
function jumpPage(e) {
    input0.value = e.innerText
    if (currentSearchEngine == 'baidu') {
        window.open(`https://www.baidu.com/s?word=${encodeURI(searchInput.val())}`);
    } else if (currentSearchEngine == 'google') {
        window.open(`https://www.google.com/search?q=${encodeURI(searchInput.val())}`);
    } else if (currentSearchEngine == 'bing') {
        window.open(`https://cn.bing.com/search?q=${encodeURI(searchInput.val())}`);
    }
}

function selectKeyword(delta) {
    var keyword = document.getElementById('keyword_show')
    const children = keyword.getElementsByTagName("div");
    if (selectedKeyword + delta >= children.length) {
        selectedKeyword = 0;
    } else if (selectedKeyword + delta < 0) {
        selectedKeyword = children.length - 1;
    } else {
        selectedKeyword += delta;
    }
    for (let i = 0; i < children.length; i++) {
        children[i].classList.remove("focus");
    }
    children[selectedKeyword].classList.add("focus");
    input0.value = children[selectedKeyword].innerHTML.replace(/(<span>).*(<\/span>)$/, "");
};
function hiddenpage2() {
    $('.navbox_show').attr('class', 'navbox');

}
$('#time').click(function (e) {
    $('.input').attr('class', 'input_hidden');
    $('.input_focus').attr('class', 'input_hidden');
    $('.searchOptBox').attr('id', 'searchOptBox_hidden');
    $('#background').attr("class", "background_max");
    $('.navbox').attr('class', 'navbox_show');
    $('#navbox').attr('style', '');
    if ($('.quotebox').css('opacity') == '1') {
        hidequote();
    }
    e.stopPropagation();
    e.preventDefault();
});
$('#nbSwitch1').click(function (e) {
    if (navbox1.style.left != "0px") {
        nbSwitch2_0.classList.remove("current");
        nbSwitch1_0.classList.add("current");
        navboxScale0()
        setTimeout(() => {
            navbox1.style.left = "0px";
            navbox2.style.left = "100%";
        }
            , 250);
        setTimeout(() => navboxScale1(), 500);
        window.cooldownScroll = true;
        setTimeout(() => window.cooldownScroll = false, 500);
    }
    e.stopPropagation();
    e.preventDefault();
});
$('#nbSwitch2').click(function (e) {
    if (navbox2.style.left != "0px") {
        nbSwitch1_0.classList.remove("current");
        nbSwitch2_0.classList.add("current");
        navboxScale0()
        setTimeout(() => {
            navbox1.style.left = "-100%";
            navbox2.style.left = "0px";
        }
            , 250);
        setTimeout(() => navboxScale1(), 500);
        window.cooldownScroll = true;
        setTimeout(() => window.cooldownScroll = false, 500);
        var notes = Number(localStorage.getItem('currentNotes'));
        if (!isNaN(notes)) {
            if (notes != 0) {
                loadNotes();
            }
        }
    }
    e.stopPropagation();
    e.preventDefault();
})
function navboxScale0() {
    var navbox1 = document.getElementById('navbox1');
    var navbox2 = document.getElementById('navbox2');
    navbox1.style.transform = "scale(0.9)";
    navbox2.style.transform = "scale(0.9)";
}
function navboxScale1() {
    var navbox1 = document.getElementById('navbox1');
    var navbox2 = document.getElementById('navbox2');
    navbox1.style.transform = "scale(1)";
    navbox2.style.transform = "scale(1)";
}
$('.nav_links').click(function (e) {
    window.open($(this).attr('href'));
    e.stopPropagation();
    e.preventDefault();
});




window.onload = function () {
    this.Get_Bing()
    fetch("https://v1.hitokoto.cn/?c=d&c=h&c=i&c=j&encode=json").then(response => response.json()).then(data => {
        document.getElementsByClassName("quote-content")[0].innerText = "「 " + data["hitokoto"] + " 」";
        document.getElementsByClassName("quote-author")[0].innerText = "——" + data["from"];
    });

}


//显示菜单
function showMenu(theMenu) {
    theMenu.style.display = "block";
    setTimeout(() => {
        theMenu.style.opacity = "1";
        theMenu.style.transform = "scale(1.05)";
    }
        , 50);
    setTimeout(() => theMenu.style.transform = "scale(1)", 300);
}
function hideMenu(theMenu) {
    theMenu.style.transform = "scale(0.5)";
    theMenu.style.opacity = "0";
    setTimeout(() => theMenu.style.display = "none", 250);
}
function showCusNavMenu(e, obj) {
    menuCusNav.style.left = e.clientX + 3 + "px";
    menuCusNav.style.top = e.clientY + 3 + "px";
    currentDeletingNav = obj.id;
    showMenu(menuCusNav);
}
window.oncontextmenu = () => {
    return false;
};
$('.customNav').mousedown(function (e) {
    if (3 == e.which) {
        showCusNavMenu(e, this)
    }
});
//搜索页右击菜单栏
function showSearchMenu(e, obj) {
    menuSearch.style.left = e.clientX + 3 + "px";
    menuSearch.style.top = e.clientY + 3 + "px";
    selectedText = window.getSelection().toString();
    if (selectedText != "") {
        searchMenuCut.classList.remove("disabled");
        searchMenuCopy.classList.remove("disabled");
    } else {
        searchMenuCut.classList.add("disabled");
        searchMenuCopy.classList.add("disabled");
    }
    showMenu(menuSearch);
}
searchMenuCut.onclick = () => {
    $("#input0").select();
    document.execCommand("cut");
    input0.focus();
}
searchMenuCopy.onclick = () => {
    $("#input0").select();
    document.execCommand("copy");
    input0.focus();
}
searchMenuPaste.onclick = event = () => {
    try {
        navigator.clipboard.readText().then(clipText => input0.value = input0.value + clipText);
    } catch (err) {
        tipBoxCopyPaste.style.left = event.clientX + 3 + "px";
        tipBoxCopyPaste.style.top = event.clientY + 3 + "px";
        showMenu(tipBoxCopyPaste);
    }
    input0.focus();
}

function showquote() {
    $('.quotebox').css('opacity', '1');
}
function hidequote() {
    $('.quotebox').css('opacity', '0');
}
function btnSettingsClick() {
    if (menuSettings.style.opacity === "1") {
        hideMenu(menuSettings);
    } else {
        showMenu(menuSettings);
    }
}
$('#btnSettings').click(function (e) {
    btnSettingsClick();
    e.stopPropagation();
    e.preventDefault();
});
function showPop(thePopUp) {
    cover1.style.display = "block";
    thePopUp.style.display = "block";
    cover1.style.opacity = "1";
    thePopUp.style.transition = "all 0s";
    thePopUp.style.transform = "none";
    thePopUp.style.transition = "all 0.25s";
    setTimeout(() => thePopUp.style.opacity = "1", 25);
}
$('#setMenuGeneral').click(function (e) {
    if (autoClrSearchBar) {
        chkAutoClrSearchBar.checked = true;
    } else {
        chkAutoClrSearchBar.checked = false;
    }
    if (openInNew) {
        chkOpenInNew.checked = true;
    } else {
        chkOpenInNew.checked = false;
    }
    if(Realtimetranslation){
        chkRealtime.checked=true;
    }else{
        chkRealtime.checked = false;
    }
    showPop(popGeneralSettings);
    e.stopPropagation();
    e.preventDefault();
});
$('#setMenuBgPref').click(function (e) {
    SetURL();
    showPop(popBg);
    e.stopPropagation();
    e.preventDefault();
});
function closePop(obj) {
    popUpClosing = true;
    cover1.style.opacity = "0";
    obj.style.opacity = "0";
    obj.style.transform = "rotate3d(1,1,0,20deg)";
    setTimeout(() => {
        cover1.style.display = "none";
        obj.style.display = "none";
        obj.style.transform = "rotate3d(1,1,0,90deg)";
        popUpClosing = false;
    }
        , 350);
};
function btnCloseHover(obj) {
    thePopUp = obj.parentNode;
    thePopUp.style.transform = "rotate3d(1,1,0,2deg)";
}
function btnCloseHover2() {
    if (popUpClosing == false) {
        thePopUp.style.transform = "none";
    }
}
function setAutoClrSearchBar() {
    if (chkAutoClrSearchBar.checked == true) {
        autoClrSearchBar = false;
        localStorage.setItem("autoClrSearchBar", "off");
        chkAutoClrSearchBar.checked = false;
    } else {
        autoClrSearchBar = true;
        localStorage.setItem("autoClrSearchBar", "on");
        chkAutoClrSearchBar.checked = true;
    }
}
function setOpenInNew() {
    if (chkOpenInNew.checked == true) {
        openInNew = false;
        localStorage.setItem("openInNew", "off");
        chkOpenInNew.checked = false;
    } else {
        openInNew = true;
        localStorage.setItem("openInNew", "on");
        chkOpenInNew.checked = true;
    }
}
function setRealtime(){
    if (chkRealtime.checked == true) {
        Realtimetranslation = false;
        localStorage.setItem("Realtimetranslation", "off");
        chkRealtime.checked = false;
    } else {
        Realtimetranslation = true;
        localStorage.setItem("Realtimetranslation", "on");
        chkRealtime.checked = true;
    }
}
$('#clrSearchbar').click(function (e) {
    setAutoClrSearchBar();
    e.stopPropagation();
    e.preventDefault();
});
$('#openinnew').click(function (e) {
    setOpenInNew();
    e.stopPropagation();
    e.preventDefault();
});
$('#Realtime').click(function (e) {
    setRealtime();
    e.stopPropagation();
    e.preventDefault();
});

$('#btnBrowse').click(function (e) {
    inputImg.value = "";
    inputImg.click();
    e.stopPropagation();
    e.preventDefault();
})
$('#contentBg').click(function (e) {
    e.stopPropagation();
    //e.preventDefault();
})




// 修改时间显示，初次打开则直接显示，以后每隔5秒更新一下时间，降低CPU使用
displayTime()
setInterval(displayTime, 5000);
$('#quotebox').click(function () {
    Inputblur();
})
$('#input0').focus(function () {
    Inputfocus();
});
$('#input0').contextmenu(function (e) {
    showSearchMenu(e, this);
});

$('.btnClose').click(function () {
    if (this.id == "genery") {
        closePop(popGeneralSettings);
    } else {
        closePop(popBg);
    }
});
$('.btnClose').mouseover(function () {
    btnCloseHover(this);
});
$('.btnClose').mouseout(function () {
    btnCloseHover2();
});
$('.bgPreviewBox').click(function () {
    changeWp(this);
})