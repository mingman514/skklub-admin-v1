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

dataTable = _dom.DataTable({
   language: lang_kor,
   serverSide: false,
   processing: true,
   responsive: true,
   searching: false,
   lengthChange: true,
   ordering: true,
   pageLength: 10,
   paging: true,
   stateSave: false,
   scrollX : true,
   ajax: {
      "url": '/getClubList',
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
                  if(isShown(auth)){
                     txtcontent += '<span class="badge badge-pill badge-success">공개중</span> '
                  } else {
                     txtcontent += '<span class="badge badge-pill badge-danger">비공개</span> '
                  }
                  if(isEditable(auth)){
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
                     if(isShown(auth)){
                        showchk = ' checked';
                     }
                     if(isEditable(auth)){
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
      }
   ]
});


_dom.find("tbody").off("click").on("click", ".viewDetail", function () { // $([selector]).on("click", "tr")를 통해 이벤트를 한 번만 생성하여 처리
console.log('clicked!')
   let _cid = $(this).data('clubid'); // get cid from 'data-clubid property'
      $.ajax({
         url:'/getClubDetail',
         type: 'POST',
         data: {cid : _cid},
         dataType: 'JSON'
   }).done(function(result){
         // console.log('RESULT : ', result[0]);
         var obj_result = result[0]
         // Draw Page --- logo 추가
         var modalTable = $('#info-table-modal, #info-table-modal2');

         $('#dt-title').text(obj_result['cname']);
         
         for (key in obj_result){
            if($('#dt-'+key) !== null){
               modalTable.find('#dt-'+key).text(obj_result[key])
            }
         }
         // Show Status Badge
         let txtcontent = ' '
         let auth = Number(obj_result['authority'])
         if(isShown(auth)){
            txtcontent += '<span class="badge badge-pill badge-success" style="margin-left:10px;">공개중</span> '
         } else {
            txtcontent += '<span class="badge badge-pill badge-danger" style="margin-left:10px;">비공개</span> '
         }
         if(isEditable(auth)){
            txtcontent += '<span class="badge badge-pill badge-default">수정가능</span>'
         } else {
            txtcontent += '<span class="badge badge-pill badge-danger">수정불가</span>'
         }

         // Account Managing
         let _cid = obj_result['cid']
         $('.resetPassword').attr('id',`reset_${_cid}`)
         $('.deleteAccount').attr('id',`delete_${_cid}`)

         modalTable.find('#dt-cname').append(txtcontent);

         // Call Modal
         $('#clubDetailModal').modal();
   }).fail(function(){
      alert("요청에 실패하였습니다. 다시 시도해주십시오.")
   }).always(function(){
      console.log('통신이 종료되었습니다.')
   })


});

// 비밀번호 재설정
$('#clubDetailTabContent').find('.resetPassword').off('click').on('click', () => {
   //**** 11/1 여기부터 - 재설정 버튼 외 콘솔 오류나??
   let resetcid = $(this).attr('id').split('_')[1]
   console.log(resetcid)
})


// 계정 삭제



// 검색 이벤트
$("#search_btn").click(function (e) {
   e.preventDefault();
   dataTable.ajax.reload()
});
$("#reset_filter").click(function (e) {
   e.preventDefault();
   $('#filterform').each(function () {
      this.reset();
   })
   $("#searchKey").focus();
   dataTable.ajax.reload()
});


// 관리모드시 특정 컬럼 보이기/숨기기
// dataTable.columns([0,9]).visible(false);

// 모드 전환
$('a.toggle-vis').on( 'click', function (e) {
   e.preventDefault();

   // Get the column API object
   var column = dataTable.column();

   // Toggle the visibility
   column.visible( ! column.visible() );
} );


// 공개/수정 권한변경
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
   $.ajaxSettings.traditional = true;
   $.ajax({
      url:'/getTargetFeature',
      type: 'POST',
      data: {
         cid : _cid,
         reqColumn : ['authority'] },
      dataType: 'JSON',
      error:function(request,error){
         alert("message:"+request.responseText);
        }
   }).then(function(result){
      let newauth = calcAuth(result['authority'], showauth, editauth);
      // 권한변경 요청 ajax
      $.ajax({
         url:'/updateAuth',
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


// Checkbox Func
// check all
$('#selectAllClub').off('click').on('click', () => {
   // 이미 모두 체크시, 체크 해제
   if($('#selectAllClub').is(':checked')){
      $('.clubChkbox').prop('checked', true);
   } else {
      $('.clubChkbox').prop('checked', false);
   }
})

_dom.find("tbody").on('click', '.clubChkbox', () => {
   // 모두 체크시, 전체선택박스 체크
   if($('.clubChkbox').length === $('.clubChkbox:checked').length){
      $('#selectAllClub').prop('checked', true)
   } else {
      $('#selectAllClub').prop('checked', false)
   }
})


// Function Declarations

function isShown(auth){
   let binNum = auth.toString(2)
   if(auth >= 4 || binNum[binNum.length-1] === '1'){ // 관리자급부턴 기본권한 허용
      return true;
   }
   return false;
}

function isEditable(auth){
   let binNum = auth.toString(2)
   if(auth >= 4 || binNum[binNum.length-2] === '1'){
      return true;
   }
   return false;
}

function calcAuth(prevauth, showauth, editauth){
   if(prevauth>3){
      return prevauth;
   }
   let binNum = showauth + (editauth << 1);

   return binNum
}
