
// Navbar
$('.navbar-brand').text('SKKLUB 마스터 관리자').css('font-weight', 'bold');
$('.navbar.navbar-dark').removeClass('indigo').addClass('red darken-3');

// Footer
$('.page-footer.font-small').removeClass('indigo').addClass('red darken-3');

// Button
$('.btn-primary').each(function (idx, item) {
    $(this).removeClass('btn-primary').addClass('danger-color');
})

$('.btn[name=manage_club]').attr('disabled', 'disabled').parent().removeAttr('href');
var manageMaster = '<a href="/master"> <button type="submit" class="btn purple-gradient btn-lg" style="width:98%; font-size:3.5vw;">SKKLUB 관리 마스터</button></a>'
$('#index-card').before(manageMaster)
//var manageMaster = '<button type="submit" class="btn purple-gradient btn-sm btn-rounded" style="max-width:120px;">SKKLUB 관리</button>'
// $('.navbar-nav.mr-auto').append(manageMaster);