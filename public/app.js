window.onload = function() {
	document.body.className = document.body.className + " loaded";
}

$('nav a').on('click', function(e) {
	var sectionName = $(this).attr('href').split('#')[1];
	if (sectionName != undefined) 
		showSection(sectionName);
	e.preventDefault();
});

$('section .close').on('click', function(e){
	e.preventDefault();
	$(this).parent('section').hide();
});

$(document).keyup(function(e) {
     if (e.keyCode == 27) { // escape key maps to keycode `27`
        $('section').hide();
    }
});

$('#fries-logo').mouseenter(function() {
	if ($('#fry-madness').length == 0) {
		var $div = $("<div>", {id: "fry-madness"});
		$('body').append($div);
	}

	$div.show();

	var imgMakerLoop = setInterval(function() {
		var randoFryNum = Math.floor(Math.random() * 4) + 1;
		var randoHeightNum = Math.floor(Math.random() * $('body').height()-200) + 1;
		var randoWidthNum = Math.floor(Math.random() * $('body').width()-200) + 1;
		var fryImageUrl = "/img/fries0"+randoFryNum+".png";
		$image = $("<img>", {src: fryImageUrl, css: { top: randoHeightNum+'px', left: randoWidthNum+'px'}});
		$div.append($image);
	}, 100);

	$('#fries-logo').mouseleave(function() {
		$('#fry-madness').remove();
		clearInterval(imgMakerLoop);
	});
});

$('#sign-up-button').on('click', function(e) {
	var scrollToPosition = $('section.join').offset().top; // Position to scroll to
  $('html, body').animate({
      'scrollTop': scrollToPosition 
  }, 500);
  e.preventDefault();
});

function showSection(section) {
	var sections = document.getElementsByTagName('section');
	for (var i=0;i<sections.length;i++) {
		if (sections[i].className == section) {
			if (section = "fries") {
				refreshFries();
			}
			sections[i].style.display = "block";
		}
	}
};

function refreshFries() {
	var randoNum = Math.floor(Math.random() * 4) + 1;
	var friesSection = document.querySelector('section.fries');
	var friesBgImageStyle = "url('/img/fries0"+randoNum+".png')";

	if (friesSection.style.backgroundImage == friesBgImageStyle) {
		refreshFries();
	} else {
		friesSection.style.backgroundImage = friesBgImageStyle;
	}
}

// Magic for the colorful inputs. Stolen from SO :D
$(".input").prop("contentEditable", true).on("input", function (){
  var loc = getCaretLocation(this);
  $(this).contents().each(function(){
    var current = this;
    if (this.nodeType == 3 || this.nodeName == "FONT") {
      $.each($(this).text().split(""), function(){
        $("<span>").text(this).css({
          color: "#"+(Math.random()*16777215|0).toString(16)
        }).insertBefore(current);
      });
      $(this).remove();
    } else {
      var crtTxt = $(current).text();
      if(crtTxt.length > 1){
        for(var i = crtTxt.length - 1; i > 0; i--){
          $("<span>").text(crtTxt[i]).css({
            color: "#"+(Math.random()*16777215|0).toString(16)
          }).insertAfter(current);
        }
      	$(current).text(crtTxt[0]);
      }
    }
  });
  if (loc == 0) {
  	clearElement(this);
  } else {
  	setCaretLocation(this, loc);
  }
});

function clearElement(ele){
	ele.innerHTML = "";
}
function setCaretLocation(ele, pos){
    var range = document.createRange(),
        sel = window.getSelection();
  	range.setStart(ele.childNodes[pos - 1], 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

function getCaretLocation(element) {
    var range = window.getSelection().getRangeAt(0),
        preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
}

$form = $('#join-form');
$form.find('button').on('click', function(e) {
	// check if button is enabled
	if (isButtonEnabled($(this))) {
		// prevent default clicking event
		e.preventDefault();

		// gather form data we know about
		var formData = {
			'name': $form.find('#input-name').text(),
			'email': $form.find('#input-email').text(),
			'links': $form.find('#input-links').text(),
			'reference': $form.find('#input-reference').text()
		};

		// validate the form data and get form object back
		var formValidation = validateForm(formData);
		if (formValidation.valid) {

			// disable button while submitting
			var buttonEl = $(this);
			buttonDisable(buttonEl)

			// Submit the form to google sheets
			$.ajax({
		    url: "https://script.google.com/macros/s/AKfycbwiJ3JIOKW-Bv8LLjG6bj2-Z9m2elQOHYsHpjOFwz2waI4pBXg/exec",
		      type: "post",
		      data: formData
		  }).done(function(){
		  	// show success and enable button
		  	showSuccess($form);
		  	buttonEnable(buttonEl);
			}).fail(function(){
				// show failure message and enable button
				showFailure($form);
				buttonEnable(buttonEl);
		  });
		} else {
			// alert with form errors
			alert(formValidation.errorMessage);
		}
	}
});

function validateForm(formData) {
	// Create a response obj
	var response = {
		valid: true,
		errorMessage: ""
	}

	// Look for empty fields, all are required
	for (var key in formData) {
		if (formData[key] == "") {
			response.errorMessage += "Enter a value for " + key + ".\n";
		}
	}

	// Check for valid email formation
	if (!validateEmail(formData['email'])) {
		response.errorMessage += "Enter a valid email address.";
	}

	// If we have errors, prepend the message
	if (response.errorMessage.length > 0) {
		response.errorMessage = "Please correct the following errors: \n" + response.errorMessage;
		response.valid = false;	
	}
	return response;
}

function showSuccess(formEl) {
	// Show success div and clear input divs
	$(formEl).find(".success").show();
	$(formEl).find("div.input").empty();
}

function showFailure(formEl) {
	// Show failure div
	$(formEl).find(".join form .failure").show();
}

function buttonEnable(buttonEl) {
	// Enable button and reset text
	$(buttonEl).removeAttr('disabled');
	$(buttonEl).html("Submit");
}

function buttonDisable(buttonEl) {
	// Set text and disable button
	$(buttonEl).html("Submitting...");
	$(buttonEl).attr('disabled','disabled');
}

function isButtonEnabled(buttonEl) {
	// Check if button is enabled
	return ($(buttonEl).attr('disabled') != "disabled")
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}