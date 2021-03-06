import Util from './modules/util.js'

(function(){

   'use strict';


// ==================================
// Datatable
// ==================================

var _dom = $(".table.clublist");

const lang_kor = {
   "decimal": "",
   "emptyTable": "데이터가 없습니다.",
   "info": "총 _TOTAL_ 건",
   "infoEmpty": "0 건",
   "infoFiltered": "(전체 _MAX_ 명 중 검색결과)",
   "infoPostFix": "",
   "thousands": ",",
   "loadingRecords": "로딩중...",
   "processing": `<img src='img/loading-table.gif' />`,
   "search": "검색 : ",
   "zeroRecords": "검색된 데이터가 없습니다.",
   "paginate": {
      "first": "첫 페이지",
      "last": "마지막 페이지",
      "next": "다음",
      "previous": "이전"
   },
   "aria": {
      "sortAscending": " :  오름차순 정렬",
      "sortDescending": " :  내림차순 정렬"
   }
};

var dataTable = _dom.DataTable({
   language: lang_kor,
   serverSide: false,
   processing: true,
   responsive: true,
   searching: false,
   lengthChange: true,
   ordering: true,
   pageLength: 10,
   paging: true,
   pagingType: "simple_numbers",
   stateSave: false,
   scrollX : true,
   autoWidth: true,
   ajax: {
      "url": '/master/getClubList',
      "type": 'POST',
      "data": function (d) {
         d.campus = $("select[name='campus']").val();
         d.category = $("select[name='category1']").val();
         d.show = $("select[name='show']").val();
         d.edit = $("select[name='edit']").val();
         d.searchCategory = $("select[name='searchCategory']").val();
         d.searchKey = $("#searchKey").val();
      }
   },
   columns: [
      {
         'data': 'cid',
         'render' : function(data){
            let _chkbox = `<input type="checkbox" class="clubChkbox" data-clubid="${data}">`
            return _chkbox
         }
     },
      {
         'data': 'cid',
         'render' : function(data){
            let viewDetailBtn = `<span class="fas fa-plus-square fa-lg viewDetail" data-clubid="${data}">`
            return viewDetailBtn
         }
     },
      {
      'data': 'authority',
       'render': function ( data, type, row ) {
                  let auth = Number(data)
                  let txtcontent = ''
                  if(Util.isShown(auth)){
                     txtcontent += '<span class="badge badge-pill badge-success">공개중</span> '
                  } else {
                     txtcontent += '<span class="badge badge-pill badge-danger">비공개</span> '
                  }
                  if(Util.isEditable(auth)){
                     txtcontent += '<span class="badge badge-pill badge-default">수정가능</span>'
                  } else {
                     txtcontent += '<span class="badge badge-pill badge-danger">수정불가</span>'
                  }
             return txtcontent;
       }
      },{
         'data': 'campus'
      },
      {
         'data': 'cname'
      },
      {
         'data': 'category1'
      },
      {
         'data': 'category2'
      },
      {
         'data': 'category3'
      },
      {
         'data': 'president_name'
      },
      {
         'data': 'president_contact'
      },
      {
         'data': 'authority',
         'render': function ( data, type, row ) {
                     let auth = Number(data)
                     let showchk = ''
                     let editchk = ''
                     if(Util.isShown(auth)){
                        showchk = ' checked';
                     }
                     if(Util.isEditable(auth)){
                        editchk = ' checked'
                     }
                     let switchContent = `
                        <div class="custom-control custom-switch">
                           <input type="checkbox" id="showSwitch_${row.cid}" class="custom-control-input showSwitch"${showchk}>
                           <label class="custom-control-label" for="showSwitch_${row.cid}">공개</label>
                        </div>
                        
                        <div class="custom-control custom-switch">
                           <input type="checkbox" id="editSwitch_${row.cid}" class="custom-control-input editSwitch"${editchk}>
                           <label class="custom-control-label" for="editSwitch_${row.cid}">수정</label>
                        </div>
                        `
                     return switchContent;
                  }
         
     }
   ],
   columnDefs: [
      {
         "targets" : '_all',
         "className" : 'dt-center'
      },
      {
         "targets": [ 0, 3, 10 ],       // checkbox, campus, auth switch
         "visible": false
     },
     {
         "targets" : [0, 1, 9, 10],    // checkbox, plus btn, contact, auth switch
         "orderable": false
     }
   ],

//    order: [[4, 'asc']],    // order by cname

// ==================================
// 캠퍼스 통합 관리자 전용 UI
// ==================================

   // when finished loading
   initComplete: function(settings, json) {
      if(json.auth === 9){
         $('select[name="campus"]').show();       // show filter
         dataTable.columns([3]).visible(true);    // show campus column
      }
    }
});


// ==================================
// 개별 모임정보 확인
// ==================================
_dom.find("tbody").off("click").on("click", ".viewDetail", function () { // $([selector]).on("click", "tr")를 통해 이벤트를 한 번만 생성하여 처리
   let _cid = $(this).data('clubid'); // get cid from 'data-clubid property'
      $.ajax({
         url:'/master/getClubDetail',
         type: 'POST',
         data: {cid : _cid},
         dataType: 'JSON'
   }).done(function(result){
         var obj_result = result[0]

         var modalTable = $('#info-table-modal, #info-table-modal2');

         $('#dt-title, #logo-cname').empty().text(Util.decodeHTMLEntities(obj_result['cname'])+' ');                              // title, logo cname
         

         if(obj_result['logo_path'] === null)
            obj_result['logo_path'] = 'alt.jpg';

         $('#dt-logo').find('img').attr('src', `../img/logo/${obj_result['logo_path']}`)     // logo path

         for (var key in obj_result){
            if($('#dt-'+key) !== null){
               modalTable.find('#dt-'+key).empty().text(Util.decodeHTMLEntities(obj_result[key]))         // else
            }
         }
         // Show Status Badge
         let txtcontent = ' '
         let auth = Number(obj_result['authority'])
         if(Util.isShown(auth)){
            txtcontent += '<span class="badge badge-pill badge-success" style="margin-left:10px;">공개중</span> '
         } else {
            txtcontent += '<span class="badge badge-pill badge-danger" style="margin-left:10px;">비공개</span> '
         }
         if(Util.isEditable(auth)){
            txtcontent += '<span class="badge badge-pill badge-default">수정가능</span>'
         } else {
            txtcontent += '<span class="badge badge-pill badge-danger">수정불가</span>'
         }

         // Data Hiding for Account Managing
         let _cid = obj_result['cid']
         $('#dt-admin_id').data('hiddenCid', _cid)    // hide in #dt-admin_id

         modalTable.find('#dt-cname').append(txtcontent);

         // Call Modal
         $('#clubDetailModal').modal();

   }).fail(function(){
      alert("요청에 실패하였습니다. 다시 시도해주십시오.")
   }).always(function(){
      console.log('통신이 종료되었습니다.')
   })


});

// ==================================
// 비밀번호 재설정
// ==================================

$('.resetPassword').off('click').on('click', (e) => {
   let _target = $('#dt-title').text()
   let target_cid = $('#dt-admin_id').data('hiddenCid')

   Util.showAlert({
      'content' : `[ ${_target} ]의 비밀번호를 재설정하시겠습니까?`
   })
   
   .done((result) => {
      $.ajax({
         url:'/master/resetPassword',
         type: 'POST',
         data: {cid : target_cid},
         dataType: 'text'
      })
   
      .done((newPassword) => {
         Util.closeAlert();
         Util.showNoticeModal({
            'title' : '비밀번호 재설정 완료', 
            'content' : `[ ${_target} ] 새로운 비밀번호는 <b>${newPassword}</b> 입니다.`
         })
      })
      .fail((msg) => {
         Util.showToast({
            'type' : 'error',
            'content' : `비밀번호 초기화에 실패하였습니다!`
         })
      })
   })
})



// ==================================
// 계정 삭제
// ==================================

$('.deleteAccount').off('click').on('click', (e) => {
   let _target = $('#dt-title').text()
   let target_cid = $('#dt-admin_id').data('hiddenCid')

   Util.showAlert({
      'title': '경고!',
      'content' : `[ ${_target} ]의 계정을 삭제하시겠습니까?`
   })
   
   .done((result) => {
      $.ajax({
         url:'/master/deleteAccount',
         type: 'POST',
         data: {cid : target_cid},
         dataType: 'JSON'
      })
   
      .done((r) => {
         Util.closeAlert();
         if(r.RESULT === 'UNAUTHORIZED'){
            Util.showNoticeModal({
               'type' : 'danger',
               'title' : '계정삭제 실패', 
               'content' : `삭제 권한이 없습니다.`
            })
         } else if(r.RESULT === 'SUCCESS'){
            Util.showNoticeModal({
               'type' : 'warning',
               'title' : '계정삭제 완료', 
               'content' : `[ ${_target} ]의 계정이 삭제되었습니다.`
            })
            $('#clubDetailModal').modal('hide');
            dataTable.ajax.reload()
         } else {
            Util.showNoticeModal({
               'type' : 'danger',
               'title' : '계정삭제 실패', 
               'content' : '오류가 발생하였습니다.'
            })
         }
      })
   })
})

// ==================================
// 검색 이벤트
// ==================================
$("#search_btn").click(function (e) {
   e.preventDefault();
   dataTable.ajax.reload()
});
$("#reset_filter").click(function (e) {
   e.preventDefault();
   $('#filterform').each(function () {
      this.reset();
   })
   
   dataTable.ajax.reload()
});


// 관리모드시 특정 컬럼 보이기/숨기기
$('#adminModeSwitch').off('click').on('click', (e) => {
   if($(e.target).prop('checked') === true){   // e.target = clicked element
      dataTable.columns([0,10]).visible(true);

      checkAllClub();
      checkEachClub();
   } else {
      $('.clubChkbox:checked, #selectAllClub').prop('checked', false);     // 모든 체크 해제
      $('#settingMode').hide();
      dataTable.columns([0,10]).visible(false);
   }
})


// ==================================
// 개별 공개-수정 권한변경
// ==================================
_dom.find("tbody").off("change").on("change", ".custom-control-input", function () {
   let chgcid = $(this).attr('id').split('_')[1]
   let showauth = 0;
   let editauth = 0;
   if($('#showSwitch_'+chgcid+':checked').length){
      showauth = 1;
   }
   if($('#editSwitch_'+chgcid+':checked').length){
      editauth = 1;
   }

   // 선택한 모임의 권한 불러오기
   let _cid = $(this).closest('tr').find('.clubChkbox').data('clubid'); // get cid from 'data-clubid property'

   // 권한
   $.ajaxSettings.traditional = true;        // 배열 형식대로 전달
   $.ajax({
      url:'/master/getTargetFeature',
      type: 'POST',
      data: {
         cid : _cid,
         reqColumn : ['authority'] },
      dataType: 'JSON',
      error:function(request,error){
         alert("message:"+request.responseText);
        }
   }).then(function(result){
      let newauth = Util.calcAuth(result['authority'], showauth, editauth);
      // 권한변경 요청 ajax
      $.ajax({
         url:'/master/update',
         type: 'POST',
         data: {
            newauth : newauth,
            target : [_cid]
         },
         dataType: 'text'
      })
   }).then(function(result){
      dataTable.ajax.reload();
   })
   // <then과 done의 차이>
   // $.ajax().then(resolvedCallback(), rejectedCallback())  ===  $.ajax().done(sucess()).fail(failure());
})


// ==================================
// Checkbox Func
// ==================================

// check all
function checkAllClub(){
   $('#selectAllClub').off('click').on('click', () => {
   // 이미 모두 체크시, 체크 해제
      if($('#selectAllClub').is(':checked')){
         console.log('here?')
         $('.clubChkbox').prop('checked', true);
      } else {
         $('.clubChkbox').prop('checked', false);
      }
      let checkedbox = $('.clubChkbox:checked').length;
      console.log(checkedbox)
      if(checkedbox){
         $('#settingMode').show();
         $('#settingMode h5 span').text(checkedbox)
      } else {
         $('#settingMode').hide();
      }
   })
}

function checkEachClub(){
   _dom.find("tbody").on('click', '.clubChkbox', () => {
      let allbox = $('.clubChkbox').length;
      let checkedbox = $('.clubChkbox:checked').length;
      // 모두 체크시, 전체선택박스 체크
      if(allbox === checkedbox){
         $('#selectAllClub').prop('checked', true)
      } else {
         $('#selectAllClub').prop('checked', false)
      }
   
      // 하나라도 체크 시, 다중선택 설정창 표시
      if(checkedbox){
         $('#settingMode').show();
         $('#settingMode h5 span').text(checkedbox)
      } else {
         $('#settingMode').hide();
      }
   })
}

// ==================================
// Multi-Setting Mode Func
// ================================== 

// Close button
 $('#settingMode').find('.btn-warning').on('click', () => {
   $('.clubChkbox:checked, #selectAllClub').prop('checked', false);     // 모든 체크 해제
   $('#settingMode').hide();
 })

 // Apply button
 $('#settingMode').find('.btn-info').off('click').on('click', () => {
   
   // Update Info
   let $category1 = $('#multiCategory1').val();
   let $multiShow = Number($('#multiShow').val());
   let $multiEdit = Number($('#multiEdit').val());

   let $targetClubs = [];
   $('.clubChkbox:checked').each(function(){       // check된 것들 cid 배열
      $targetClubs.push($(this).data('clubid'));
   })
   Util.showAlert({
      'content' : `
      <b>${$targetClubs.length}개 모임</b>을 다음과 같이 변경합니다.<br><br>
      <div class="mb-3">
      <span style="font-size: 20px; padding: 0.7rem 3rem; border: 1px solid gray;">
         ${$category1 === '' ? '' : $category1 + ' / ' }${$multiShow ? '공개' : '비공개' } / ${$multiEdit ? '수정가능' : '수정불가'}
      </span>
      </div>
   `})
   .then(function(data){
      Util.closeAlert();

      $.ajaxSettings.traditional = true;
      $.ajax({
         url:'/master/update',
         type: 'POST',
         data: {
            category1 : $category1,
            newauth : Util.calcAuth(0, $multiShow, $multiEdit),
            target : $targetClubs
         },
         dataType: 'text'
      }).then(function(result){
         Util.showToast({
            'type' : 'success',
            'title' : `작업 완료`,
            'content' : `성공적으로 변경되었습니다.`
         })
         
         console.log(result);      
         dataTable.ajax.reload();
         $('#selectAllClub').prop('checked', false);
         $('#settingMode').hide();
      })
   })
 })

})();
