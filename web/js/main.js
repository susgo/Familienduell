﻿var fragen = null;
var intro = null;
var introVolume = 1;
var jeopardy = null;
var schweinchenVolume = 1;
var jeopardyVolume = 1;
var schweinchen = null;

$(document).ready(function() {
	$( "#fragenListe" ).sortable();

    $("#printQuestions").click(function() {
    	$("#printDiv").empty();
    	showQuestionsAsPrint();
    	$("#printScreen").show();
    	$("#allContent").hide();
    	window.print();
    	$("#printScreen").hide();
    	$("#allContent").show();
    });

    $("#blackScreenCheck").change(function() {
    	wsSend("toggleBlackScreen", "");
    });

    $("#modeFinal").change(function() {
    	var status = $('#modeFinal').is(':checked');
        wsSend("toggleFinalMode", status);
    });

    $("#player2").change(function() {
        var player = $('#player2').is(':checked');
        wsSend("setPlayer2ForFinalMode", player);
    });

    $("#startJeopardybtn").click(function() {
    	$("#startJeopardybtn").attr("disabled", "disabled");
    	wsSend("startJeopardy", "");
    });

     $("#stopJeopardybtn").click(function() {
     	$("#startJeopardybtn").removeAttr("disabled");
     	wsSend("stopJeopardy", "");
    });

     $("#jeopardyVolume").on("input", function() {
		var v = parseFloat($(this).val()) / 10;
		wsSend("setJeopardyVolume", v);	
	});

    $("button[id^='startScheinchenbtn']").each(function(){
        $(this).click(function() {
            var status = $(this).attr('value');
            console.log('status' + status);
            wsSend("setRunde", status);
            $(this).attr("disabled", "disabled");
            wsSend("startSchweinchen", "");
        });
    });

    $("#stopScheinchenbtn").click(function() {
        $("button[id^='startScheinchenbtn']").each(function(){
            $(this).removeAttr("disabled");
        });
        wsSend("stopSchweinchen", "");
    });

     $("#schweinchenVolume").on("input", function() {
		var v = parseFloat($(this).val()) / 10;
		wsSend("setSchweinchenVolume", v);	
	});

	$("#addNewQuestionBtn").click(function() {
		addNewQuestion(null);
	});

	$("#openFragenEditorBtn").click(function() {
		$("#editQuestionsDiv").show();
	});

	$("#closeFragenEditorIcon").click(function() {
		$("#editQuestionsDiv").hide();
	});

	$("#saveNewQuestions").click(function() {
		saveQuestions();
		alert("Gespeichert!");
	});

	$("#upQicon").click(function() {
		var index = $("#questionsSelcet>option:selected").index();
		index--;
		setFrageIndex(index);
	});

	$("#downQicon").click(function() {
		var index = $("#questionsSelcet>option:selected").index();
		index++;
		setFrageIndex(index);
	});

	$("#questionsSelcet").on("change", function() {
		changeFrage();
	});

	$("#startIntroBtn").click(function() {
		$("#startIntroBtn").attr("disabled", "disabled");
		wsSend("showIntro", "");
	});

	$("#stopIntroBtn").click(function() {
		$("#startIntroBtn").removeAttr("disabled");
		wsSend("hideIntro", "");
	});

	$("#introVolume").on("input", function() {
		var v = parseFloat($(this).val()) / 10;
		wsSend("setIntroVolume", v);	
	});

	$("#pointsToTheLeft").click(function() {
		var points = parseFloat($(".pointsLeft").text()) + parseFloat($("#SumRes").text());
		wsSend("setLeftPoints", points);
		$("#SumRes").text("0");
	});

	$("#pointsToTheRight").click(function() {
		var points = parseFloat($(".pointsRight").text()) + parseFloat($("#SumRes").text());
		wsSend("setRightPoints", points);
		$("#SumRes").text("0");
	});

	$("#newLeftPoints").click(function() {
		wsSend("setLeftPoints", $("#mPunkteLeft").val());
	});

	$("#newRightPoints").click(function() {
		wsSend("setRightPoints", $("#mPunkteRight").val());
	});

});

function setFinalMode(status){
	isFinalMode = status;
}

function setPlayer2(value){
	player2 = value;
}

function setRunde(value){
	runde = value;
}

function showQuestionsAsPrint() {
	var ges = '<h2 style="margin-left:30px;">Familienduell Fragen</h2><ol>';
	for(var i=0;i<fragen.length;i++) {
		ges += '<li>'+fragen[i]["frage"]+'</li>';
	}
	ges +='</ol>';
	$("#printDiv").html(ges);
}

function setLeftPoints(newPoints) {
	$(".pointsLeft").text(newPoints);
	$("#mPunkteLeft").val(newPoints);
	if(sounds && (display || serverSound)) {
		audio = new Audio('./sounds/zahlRichtig.mp3');
		audio.play();
	}
}

function setRightPoints(newPoints) {
	$(".pointsRight").text(newPoints);
	$("#mPunkteRight").val(newPoints);
	if(sounds && (display || serverSound)) {
		audio = new Audio('./sounds/zahlRichtig.mp3');
		audio.play();
	}
}

function startJeopardy() {
	if(sounds && (display || serverSound)) {
		jeopardy = new Audio('./sounds/failFinal.mp3');
		jeopardy.volume = jeopardyVolume;
		jeopardy.play();
	}
}

function stopJeopardy() {
	if(jeopardy) {
		jeopardy.pause();
	}
}

function startSchweinchen() {
	if (runde == 2){
        $("#schweinchen2Img").show();
	} else if (runde == 3){
        $("#schweinchenImg").show();
	} else {
        $("#schweinchen1Img").show();
	}

	$("#answers").hide();
	$("#displayQuestions").hide();
	
	if(sounds && (display || serverSound)) {
		schweinchen = new Audio('./sounds/schweinchen.wav');
		schweinchen.volume = schweinchenVolume;
		schweinchen.play();
	}
}

function stopSchweinchen() {
	var index = $("#questionsSelcet>option:selected").index();
	$("#questionsSelcet").val(index+1);
	changeFrage();

	$("#schweinchenImg").hide();
    $("#schweinchen1Img").hide();
    $("#schweinchen2Img").hide();
	$("#answers").show();
	$("#displayQuestions").show();
	if(schweinchen) {
		schweinchen.pause();
	}
}

function hideIntro() {
	$(".noIntro").show();
	$(".intro").hide();
	if(intro) {
		intro.pause();
	}
}

function showIntro() {
	$(".noIntro").hide();
	$(".intro").show();
	if(sounds && (display || serverSound)) {
		intro = new Audio('./sounds/intro.mp3');
		intro.volume = introVolume;
		intro.play();
	}
}

function fillFragenSelect() {
	$("#questionsSelcet").empty();
	for(var i=0;i<fragen.length;i++) {
		$("#questionsSelcet").append('<option value="'+i+'">'+fragen[i]["kuerzel"]+'</option>');
	}
}

function setFrageIndex(index) {
	if(index >= 0 && index < $("#questionsSelcet").find("option").length) {
		$("#questionsSelcet").find("option").removeAttr("selected");
		$($("#questionsSelcet").find("option")[index]).prop("selected", "true");
	}
	if($("#questionsSelcet>option:selected").index() == -1 && $("#questionsSelcet").find("option")[0] )
		$($("#questionsSelcet").find("option")[0]).prop("selected", "true");

	changeFrage();
}

function changeFrage() {
	var index = $("#questionsSelcet>option:selected").index();
	wsSend("loadQuestion", index);
	wsSend("clearAllFailsBtn", "");
}

function loadQuestionToGui(index) {
	$("#schweinchenImg").hide();
    $("#schweinchen1Img").hide();
    $("#schweinchen2Img").hide();
	if (!(player2 && display)) {
		$("#answers").empty();
    }

	$('.footer').toggle(!isFinalMode);
    $('.xmarker').toggle(!isFinalMode);
    $("#ResSum_player1").toggle(isFinalMode);
    $("#ResSum_player2").toggle(isFinalMode);
    if (!isFinalMode){
    	$("#resultFinal").hide();
	} else {
        $("#resultFinal").show();
	}
    $("#result").toggle(!isFinalMode);

	if(index > -1) {
        $("#displayQuestions").html(fragen[index]["frage"]);
		if (isFinalMode){
            $("#displayQuestions").hide();
		} else {
            $("#displayQuestions").show();
		}
		for(var i=0;i<fragen[index]["antworten"].length;i++) {
			if(fragen[index]["antworten"][i]["antwort"] != "") {
                if (!isFinalMode) {
                    var oneLine = $('<div style="height:55px">' +
                        '<div style="width: 52px; float: left;" class="nr">' + (i + 1) + '.</div>' +
                        '<div style="width: 860px; float: left;" class="answer"></div>' +
                        '<div style="width: 52px; float: left;" class="points"></div>' +
                        '</div>');
                } else {
                    var oneLine = $('<div style="height:55px">' +
                        '<div style="width: 430px; float: left;" class="answer"></div>' +
                        '<div style="width: 52px; float: left;" class="points"></div>' +
                        '<div style="width: 52px; float: left;" class="points_player2"></div>' +
                        '<div style="width: 430px; float: left;" class="answer_player2"></div>' +
                        '</div>');
                }
	    		if(display && !player2) {
                    if (isFinalMode) {
                        oneLine.find(".answer").text("_ _ _ _ _ _ _ _ _ _");
                    } else {
                        oneLine.find(".answer").text("_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _");
					}
	    			oneLine.find(".points").text("--");
	    			if (isFinalMode){
	    				oneLine.find(".points_player2").text("--");
	    				oneLine.find(".answer_player2").text("_ _ _ _ _ _ _ _ _ _");
	    			}
	    		} else if (!display) {
	    			oneLine.find(".answer").html('<span class="markOnHover">'+getAnswerString(fragen[index]["antworten"][i]["antwort"])+'</span>');
	    			oneLine.find(".points").html('<span class="markOnHover">'+fragen[index]["antworten"][i]["anz"]+'</span>');
	    			(function() {
	    				var is = i;
	    				var frage = fragen[index];
	    				oneLine.find(".answer").click(function() {
	    					wsSend("setAnswer", is+"###"+frage["antworten"][is]["antwort"]);
	    				});
	    				oneLine.find(".points").click(function() {
	    					wsSend("setAnz", is+"###"+frage["antworten"][is]["anz"]);
	    				});
	    			})();
	    		}
	    		$("#answers").append(oneLine);
	    	}
		}
	}
	if (!isFinalMode) {
        $("#SumRes").text("0");
    }
	if (isFinalMode){
        if (!player2) {
            $('#SumRes_player1').html("0");
            $('#SumRes_player2').html("0");
        }
	}
	if (!player2) {
        recalcSum(0);
    }
}

function setAnswer(index, answer) {
    var answer_select = ".answer";
    if (player2){
    	answer_select = '.answer_player2';
	}
	answer = getAnswerString(answer);
	var el = $($("#answers").find(answer_select)[index]);
	el.empty();
	if(sounds && (display || serverSound)) {
		audio = new Audio('./sounds/textRichtig.mp3');
		audio.play();
	}
	el.typed({
        strings: [answer],
        typeSpeed: 20
    });
}

function setAnz(index, nr) {
    var points_select = ".points";
    if (player2){
    	points_select = '.points_player2';
	}
	var el = $($("#answers").find(points_select)[index]);
	el.text(nr);
	if(sounds && (display || serverSound)) {
		audio = new Audio('./sounds/zahlRichtig.mp3');
		audio.play();
	}
	recalcSum(nr);
}

function recalcSum(s) {
	var sum_selector = '#SumRes';
	if (isFinalMode) {
        if (player2) {
            sum_selector = '#SumRes_player2';
        } else {
            sum_selector = '#SumRes_player1';
        }
    }
	$(sum_selector).text(parseFloat($(sum_selector).text())+parseFloat(s));
}

function getAnswerString(str) {
	var anz = str.length;
	if(anz%2==0) {
		str+="_";
	}
	anz = str.length;
	var maxLength = 40;
	if (isFinalMode){
		maxLength = 20;
	}
	while(str.length < maxLength) {
		str+= " _";
	}
	return str;
}

function fillFragenEditor() {
	$("#fragenListe").empty();
	for(var i=0;i<fragen.length;i++) {
		addNewQuestion(fragen[i]);
	}
}

function loadQuestions() {
	wsSend("fileOp","read###fragen.txt");
}

function saveQuestions() {
	var objToSave = [];
	$.each($("#fragenListe").find("li"), function() {
		var oneQ = {
			"frage" : $(this).find(".questionIn").val(),
			"kuerzel" : $(this).find(".questionKIn").val(),
			"antworten" : []
		};
		$.each($(this).find(".antTr"),function() {
			oneQ["antworten"].push({
				"antwort" : $(this).find(".antwortInp").val(),
				"anz" : $(this).find(".anz").val()
			});
		});
		objToSave.push(oneQ);
	});
	var jsonQues = JSON.stringify(objToSave);
	jsonQues = btoa(encodeURIComponent(jsonQues));
	wsSend("fileOp","write###fragen.txt###"+jsonQues);
}

function addNewQuestion(frage) {
	var newQHtml = $('<li style="list-style-type: none; padding: 5px; border: 1px solid black; margin-right: 80px; position: relative;"><i style="cursor:pointer; position: absolute; right: 5px;" class="fa fa-trash-o trash"></i><table>'+
		'<tr>'+
			'<td>Frage:</td><td><input class="questionIn" type="text"></td>'+
		'</tr><tr>'+
			'<td>Kürzel:</td><td><input class="questionKIn" type="text"></td>'+
		'</tr><tr class="antTr">'+
			'<td>Antwort 1:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>'+
		'</tr><tr class="antTr">'+
			'<td>Antwort 2:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>'+
		'</tr><tr class="antTr">'+
			'<td>Antwort 3:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>'+
		'</tr><tr class="antTr">'+
			'<td>Antwort 4:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>'+
		'</tr><tr class="antTr">'+
			'<td>Antwort 5:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>'+
		'</tr><tr class="antTr">'+
			'<td>Antwort 6:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>'+
		'</tr><tr>'+
	'</table></li>');
	if(frage != null) {
		newQHtml.find(".questionIn").val(frage["frage"]);
		newQHtml.find(".questionKIn").val(frage["kuerzel"]);
		for(var i=0;i<frage["antworten"].length;i++) {
			$(newQHtml.find(".antwortInp")[i]).val(frage["antworten"][i]["antwort"]);
			$(newQHtml.find(".anz")[i]).val(frage["antworten"][i]["anz"]);
		}
	}
	newQHtml.find(".trash").click(function() {
		$(this).parent("li").remove();
	});
	$("#fragenListe").append(newQHtml);
}