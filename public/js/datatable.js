
       
       let _self = this;
       let dataTable = null;
 
       function initialize() {
          initDataTable();
          initUI();
       }
       
       function initDataTable() {
          var _dom = $(".table.clublist");
 
          const lang_kor = {
             "decimal" : "",
             "emptyTable" : "데이터가 없습니다.",
             "info" : "총 _TOTAL_ 건",
             "infoEmpty" : "0 건",
             "infoFiltered" : "(전체 _MAX_ 명 중 검색결과)",
             "infoPostFix" : "",
             "thousands" : ",",
             "loadingRecords" : "로딩중...",
             "processing" : `<img src='img/loading-table.gif' />`,
             "search" : "검색 : ",
             "zeroRecords" : "검색된 데이터가 없습니다.",
             "paginate" : {
                "first" : "첫 페이지",
                "last" : "마지막 페이지",
                "next" : "다음",
                "previous" : "이전"
             },
             "aria" : {
                "sortAscending" : " :  오름차순 정렬",
                "sortDescending" : " :  내림차순 정렬"
             }
          };
 
          dataTable = _dom.DataTable({
             language : lang_kor,
             serverSide: false,
             processing: true,
             responsive : true,
             searching : false,
             lengthChange : true,
             ordering: true,
             pageLength: 10,
             paging: true,
             stateSave: true,
             ajax: {
                "url": '/getData',
                "type" : 'POST',
                "data": function (d) {
                   d.campus = $("select[name='campus']").val();
                   d.category = $("select[name='category1']").val();
                   d.status = $("select[name='status']").val();
                   d.searchCategory = $("select[name='searchCategory']").val();
                   d.searchKey = $("#searchKey").val();
                }
             },
             columns: [
                { 'data': 'cid' },
                { 'data': 'cname' },
                { 'data': 'category1' },
                { 'data': 'authority' }
             ],
             columnDefs : [ {
                "className" : "dt-center",
                "targets" : "_all"
             }, {
                "width" : "5%",
                "targets" : 0
             } ]
          });
          
 
          _dom.find("tbody").off("click").on("click", "tr", function() {
              console.log('click table row!')
             // 한 번 클릭 시 이동 version
             /*o2.$.map.clear();
             if ($(this).hasClass("selected") == false) {
                dataTable.$("tr.selected").removeClass("selected");
                $(this).addClass("selected");
             }else{
                return false;
             }
             var _data = dataTable.rows(".selected").data();
             if (_data.length > 0) {
                var data = _data[0];
                var sessionId = data.SESSION_ID;
                dmas.util.API.setMakerSession(sessionId);
                dmas.cmmn.main.setSessionInfo(data);
 
                dmas.cmmn.main.clearClickResource();
 
                dmas.util.API.makeGraph(sessionId).done(function(r) {
                   if (r.SUCCESS == true) {
                      var pattern = new dmas.panel.AnalysisPattern();
                      var options = {SESSION_ID : sessionId}
                      pattern.setData(options);
                      $('a[href="#tab3"]').removeClass("disabled");
                   }
                });
 
                $(this).addClass("selected");
             }*/
          });
       }
 
       function initUI() {

          // 검색
          $("#search_btn").click(function(e){
             e.preventDefault();
             _self.drawTable();
          });
 
          // 필터초기화
          $("#reset_filter").click(function(){
             $("select[name='campus']").text('캠퍼스').attr("selected","selected");
             $("select[name=category1]").text('모임구분').attr("selected","selected");
             $("select[name='status']").val('승인여부').attr("selected","selected");
             $("#searchKey").val('').focus();
            //  $("#search_btn").click();
          })
       }
       
       this.drawTable = function() {
          dataTable.draw();
       }
 
       initialize();