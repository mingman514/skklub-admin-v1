// IE
if(isIE()){
    var _html = '<div class="ie_content"><div class="ie_msg"><p class="lead"><mark>Internet Explorer</mark>는 지원하지 않습니다!</p><p class="text-muted"><a href="https://www.google.co.kr/chrome/?brand=CHBD&gclid=CjwKCAiA6aSABhApEiwA6Cbm_yzY4qMpPoI_NdoOq2OHGwEbnzNsfIkhPVZk4a3RnQ5fKIpKYuj1XxoCargQAvD_BwE&gclsrc=aw.ds">Chrome</a> 또는 <a href="https://www.microsoft.com/ko-kr/edge">Edge</a> 브라우저를 이용해주세요.</p></div><img src="/img/skk_character9.jpg"></div>';

// <div class="ie_content">
// <div class="ie_msg">
// Internet Explorer는 지원하지 않습니다.<br>
// Chrome 또는 Edge 사용을 권장합니다.
// </div>
// <img src="/img/skk_character9.jpg">   
// </div>
    
    $('.mh').html(_html);
}

function isIE() {
    const ua = navigator.userAgent;
    return ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1;
};