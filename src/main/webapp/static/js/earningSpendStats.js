$(function(){
    $('#dg').datagrid({
        url:'earningSpendStatsData',
        pagination:true,
        fitColumns:true,
        rownumbers:true,
        sortName:'szDate',
        sortOrder:'desc',
        queryParams:{
        	type:$(".searchDiv input[name='search_type']:first").prop("checked")?0:1
        },
        columns:[[
            {field:'szDate',title:'时间',width:100,align:'center',sortable:true},
            {field:'spendMoney',title:'支出',width:100,align:'center',sortable:true,formatter: function(value,row,index){
				if (value==null){
					return 0;
				} else {
					return value;
				}
			}},
            {field:'earningMoney',title:'收入',width:100,align:'center',sortable:true,formatter: function(value,row,index){
				if (value==null){
					return 0;
				} else {
					return value;
				}
			}}
        ]],
        onLoadSuccess:function(data){
        	initChart();
        }
    });
    
    $(".searchDiv input[name='search_type']:eq(0)").click(function(){
    	$("#search_caId").combotree("reload","../category/treeData?type=0");
    });
    
    $(".searchDiv input[name='search_type']:eq(1)").click(function(){
    	$("#search_caId").combotree("reload","../category/treeData?type=1");
    });
    
    $("#search_caId").combotree({
        url: '../category/treeData?type=0',
        width:150,
        multiple:true
    });
    
    $("#search_mId").combobox({
        url: '../member/comboboxData',
        valueField:'mId',
        textField:'callName',
        width:150,
        multiple:true
    });
    $("#search_groupBy").combobox({
        data: [{id:"day",text:"天"},{id:"month",text:"月"},{id:"year",text:"年"}],
        valueField:'id',
        textField:'text',
        width:150,
        onLoadSuccess:function(){
        	$("#search_groupBy").combobox("clear");
        }
    });
    
    
    $("#searchBtn").click(function(){
    	$('#dg').datagrid("options").queryParams={
    		groupBy:$("#search_groupBy").combobox("getValue"),
    		beginDate: $("#search_beginDate").datebox("getValue"),
    		endDate: $("#search_endDate").datebox("getValue")
    	};
    	$('#dg').datagrid("reload");
    });
    
    $("#clearBtn").click(function(){
    	$("#search_caId").combotree("clear");
		$("#search_mId").combobox("clear");
		$("#search_beginDate").datebox("clear");
		$("#search_endDate").datebox("clear");
		$("#search_beginMoney").numberbox("clear");
		$("#search_endMoney").numberbox("clear");
		$("#search_groupBy").combobox("clear");
		$(".searchDiv input[name='search_type']:first").prop("checked",true)
    	$('#dg').datagrid("options").queryParams={type:0};
    	$('#dg').datagrid("reload");
    });
    
   
    
});
function formatterDate(date) {
	var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
	var month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0"
	+ (date.getMonth() + 1);
	return date.getFullYear() + '-' + month + '-' + day;
};


function initChart(){
	$.ajax({
		type : "POST",
		url : "earningSpendStatsData",
		dataType:"json",
		data : {
			groupBy : $("#search_groupBy").combobox("getValue"),
			beginDate : $("#search_beginDate").datebox("getValue"),
			endDate : $("#search_endDate").datebox("getValue")
		},
		success : function(data) {
			data = data.rows;
			var xaxis = [];
			//var yaxis = [];
			var seriesData = new Array();
			var earningMoney=new Array();
			var spendMoney=new Array();
			var earningMoneyTT=0;
			var spendMoneyTT=0;
			for ( var i in data) {
				xaxis.push(data[i].szDate);
				earningMoney.push(data[i].earningMoney);
				spendMoney.push(data[i].spendMoney);
				earningMoneyTT+=isNaN(data[i].earningMoney)?0:data[i].earningMoney;
				spendMoneyTT+=isNaN(data[i].spendMoney)?0:data[i].spendMoney;
			}
			
			var seriesData2 = new Array();
			seriesData.push({
				name : "收入",
				type : "bar",
				label : {
					normal : {
						show : true,
						position : 'inside'
					}
				},
				data : earningMoney
			},{
				name : "支出",
				type : "bar",
				label : {
					normal : {
						show : true,
						position : 'inside'
					}
				},
				data : spendMoney
			});
			var myChart = echarts.init(document.getElementById('chart'), 'macarons');
			var myChart2 = echarts.init(document.getElementById('chart2'), 'macarons');
			var option = {
				title : {
					left : "center",
					text : "收支统计图"
				},
				tooltip : {
					trigger : 'axis',
					
					axisPointer : {
						type : 'shadow'
					}
				},
				legend : {
					left : "right",
					top : 25,
					data : ["收入","支出" ]
				},
				xAxis : {
					type : 'category',
					data : xaxis
				},
				yAxis : {
					type : 'value'
				},
				series : seriesData
			};
			myChart.setOption(option);
			
			option2 = {
		    	    title : {
		    	        text: '收支统计图',
		    	        x:'center'
		    	    },
		    	    legend : {
						left : "right",
						top : 25,
						data : ["收入","支出" ]
					},
		    	    tooltip : {
		    	        trigger: 'item',
		    	        formatter: "{b} <br/>{a}{c}元 ({d}%)"
		    	    },
		    	    series : [
		    	        {
		    	            name:"收支",
		    	            type: 'pie',
		    	            radius : '55%',
		    	            center: ['50%', '60%'],
		    	            data:[{value:earningMoneyTT, name:'收入'},
		    	                  {value:spendMoneyTT, name:'支出'}],
		    	            itemStyle: {
		    	                emphasis: {
		    	                    shadowBlur: 10,
		    	                    shadowOffsetX: 0,
		    	                    shadowColor: 'rgba(0, 0, 0, 0.5)'
		    	                }
		    	            }
		    	        }
		    	    ]
		    	};
		    myChart2.setOption(option2);
			
			$('#dg').datagrid('resize',{
				width:$("body").width()
			});
		}
	});
}
