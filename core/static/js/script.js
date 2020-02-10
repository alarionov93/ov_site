/**
 * Created by sanya on 17.03.16.
 */

;
$page = {};
// var date = new Date();
// var num = Math.random(date)*100000000;
// $page.orderNumber = num.toFixed(0);
// if ($page.orderNumber.length < 9) {
//     $page.orderNumber *= 10;
// }

function Waiter() {
    var self = this;
    self.status = ko.observable(false);
    self.show = function () {
        self.status(true);
    };
    self.hide = function () {
        self.status(false);
    };
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function ViewModel() {
	var self = this;

	self.waiter = new Waiter();

	self.textFieldOpened = ko.observable(false);
	self.imgPreviews = ko.observableArray([]);
	self.isEditingImgsData = ko.observable(false);
	self.allTexts = ko.observableArray([]);
	self.chosenText = ko.observable();
	// self.coordinatesOfChosenFragment = ko.observableArray();
	self.relationIsValid = ko.computed(function() {
		return !!self.chosenText() && !!self.chosenText().coordinates();
	}, self);
	// self.relationIsValid.subscribe(function(newValue) {
	// 	console.log(newValue);
	// });
	self.getImgPreviews = function() {
		self.waiter.show();
		var csrftoken = getCookie('csrftoken');
		console.log(csrftoken);
		$.post("previews/get/", {csrfmiddlewaretoken: csrftoken}).then(function (resp) {
            console.log(resp);
            if(resp.length == 0) {
                // TODO: handle it?
            } else {
                for (var i = 0; i < resp["previews"].length; i++) {
                	self.imgPreviews.push(new Image(resp["previews"][i].id, resp["previews"][i].link_prev, resp["previews"][i].link_full, resp["previews"][i].fragments));
                }
                for (var i = 0; i < resp["texts"].length; i++) {
                	if (resp["texts"][i].has_image == false) {
                		self.allTexts.push(new TextFragment(resp["texts"][i].id, resp["texts"][i].author, resp["texts"][i].description, resp["texts"][i].has_image));
                	}
                }
                self.updateTexts();
            }
        }).always(function () {
            self.waiter.hide();
        });
	};
	self.getImgPreviews();

	// self.activeImgPreview = ko.observable(self.imgPreviews()[0]);// first by default
	self.activeImgPreview = ko.observable();
	self.setActiveImgPreview = function(preview) {
		for (var i = 0; i < self.imgPreviews().length; i++) {
			self.imgPreviews()[i].isActive(false);
		}
		preview.isActive(true);
		self.activeImgPreview(preview);
		// set full image here
	}

	self.updateTexts = function() {
		if (localStorage.getItem('chosenTextId') !== null) {
			var chosenTextId = localStorage.getItem('chosenTextId');
			for (var i = 0; i < self.allTexts().length; i++) {
				if (self.allTexts()[i].id == chosenTextId) {
					var arrayChosenTextId = i;
					self.chosenText(self.allTexts()[i]);
				}
			}
			self.allTexts.splice(arrayChosenTextId, 1); //remove item already placed in chosenText from allTexts
		} else {
			self.chosenText(self.allTexts.shift());
			localStorage.setItem('chosenTextId', self.chosenText().id);
		}
	};
	self.setRelation = function() {
		// ajax request to server here, save data
		self.chosenText().hasImage(true);
		// push text fragment back to allTexts
		// TODO: check if it has image and coordinates
		self.allTexts.push(self.chosenText());
		// remove text fragment that has image from allTexts here:
		for (var i = 0; i < self.allTexts().length; i++) {
        	if (self.allTexts()[i].hasImage == true) {
        		self.allTexts()[i]; //new text fragment with image and coord
        	}
        }
        self.updateTexts();

		// 2. Get new list of images and text fragments - ???? OR not to send the same data again?
    	//self.updateTexts();
		console.log("Setting relation...");
	};
}

function Image(id, linkPrev, linkFull, fragments) {
	this.id = id;
	this.linkPrev = linkPrev;
	this.linkFull = linkFull;
	this.isActive = ko.observable(false);

	this.imgFragments = ko.observableArray(fragments);

}

function TextFragment(id, author, description, hasImage) {
	this.id = id;
	this.author = ko.observable(author);
	this.description = ko.observable(description);
	this.hasImage = ko.observable(hasImage);
	this.coordinates = ko.observable(null);
	// this.x_lt = 0;
	// this.y_lt = 0;
	// this.x_rb = 0;
	// this.y_rb = 0;
}
// TODO: jQuery extending example
jQuery.expr.filters.onscreen = function(el) { // only by height !
  var rect = el.getBoundingClientRect();
  return (rect.bottom > 100) && (rect.top > -rect.height && rect.top < window.innerHeight);
};

$(document).ready(function() {

	String.prototype.includes = function(symbol) {
        var includes = false;
        for (var i = 0; i < this.length; i++) {
            if (this[i] == symbol) {
                includes = true;
            } 
        }
        return includes;
    };

    String.prototype.startsWith = function(substr) {
    	var startsWith = false;
    	for (var i = 0; i < substr.length; i++) {
    		if(this[i] === substr[i]) {
    			startsWith = true;
    		} else {
    			startsWith = false;
    			break;
    		}
    	}
    	return startsWith;
    };

    VM = new ViewModel();
	ko.applyBindings(VM);

	if(window.location.hash.length > 0 && window.location.hash === "#contact") {
		$(document).ajaxComplete(function() {
			$(document).scrollTop($(document).innerHeight());			
		});
	}

	$(document).on("scroll", function() {

	});

	var top_left = 0;
	var bottom_right = 0;
	var x_old = 0;
	var y_old = 0;
	$(document).on("click", ".image-preview",function(evt) {
		if(typeof(VM.activeImgPreview()) !== 'undefined' && bottom_right == 0) {
			console.log(evt);
			var x_lt = evt.offsetX;
			var y_lt = evt.offsetY;
			var x_br = evt.offsetX - x_old;
			var y_br = evt.offsetY - y_old;
			if (!top_left) {
				// $("#image-background-1").html('');
				$("#image-overlay-1").css('left', x_lt);
				$("#image-overlay-1").css('top', y_lt);
				x_old = x_lt;
				y_old = y_lt;
				top_left = 1;
			} else {
				$("#image-overlay-1").css('width', x_br);
				$("#image-overlay-1").css('height', y_br);
				bottom_right = 1;
				VM.chosenText().coordinates({'x_lt': x_lt, 'y_lt': y_lt, 'x_br': x_br, 'y_br': y_br});
				// set coordinates to chosenText here, add button 'ok' anywhere near hear
			};
		};
	});
	function resetSelectedFragment() {
		// VM.coordinatesOfFragment([0, 0, 0, 0]);
		VM.chosenText().coordinates(null);
	};
	$(document).on("click", "#image-overlay-1",function(evt) {
		evt.stopPropagation();
		top_left = 0;
		bottom_right = 0;
		x_old = 0;
		y_old = 0;
		$("#image-overlay-1").css('left', 0);
		$("#image-overlay-1").css('top', 0);
		$("#image-overlay-1").css('width', 0);
		$("#image-overlay-1").css('height', 0);
		resetSelectedFragment();
	});
	$(window).resize(function() {
	
	});

	$(window).scroll(function() {
		
	});

    $('body').on('keydown', function (evt) {
        if (evt.keyCode === 9) {
            var hasClass = $(document.activeElement).hasClass('enum');
            if(hasClass) {
                if (parseInt(document.activeElement.attributes.tabindex.nodeValue) === VM.orderUnits().length * 3) {
                    console.log("Copying last line..");
                    VM.copyLastOrderUnit();
                }
            }
        }
    });
});