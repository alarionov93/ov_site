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

var top_left = 0;
var bottom_right = 0;
var x_old = 0;
var y_old = 0;

var colors = [
	"#ff0000",
	"#cc00ff",
	"#0015ff",
	"#00c8ff",
	"#00ff2f",
	"#ffea00",
	"#ff7300",
	"#ff0000"
	// "#",
	// "#",
];

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

function resetSelectedFragment(evt) {
	if (evt) { // if there is evt, user clicked to fragment to reset it, if not, user clicked to "ready" btn
		evt.stopPropagation();
		VM.chosenText().coordinates(null);
		VM.chosenText().imageId = null;
		VM.changesAreSaved(true);
	}
	top_left = 0;
	bottom_right = 0;
	x_old = 0;
	y_old = 0;
	$("#image-overlay-1").css('left', 0);
	$("#image-overlay-1").css('top', 0);
	$("#image-overlay-1").css('width', 0);
	$("#image-overlay-1").css('height', 0);
};

function ViewModel() {
	var self = this;

	self.waiter = new Waiter();

	self.getMode = function() {
		if (localStorage.getItem('mode') === null) {
			return false;
		} else {
			return localStorage.getItem('mode') == '0' ? false : true;
		}
	};
	var selectedMode = self.getMode();

	self.textFieldOpened = ko.observable(false);
	self.imgPreviews = ko.observableArray([]);
	// self.isEditingImgsData = ko.observable(self.getMode());
	self.isEditingImgsData = ko.observable(selectedMode);
	self.allTexts = ko.observableArray([]);
	self.chosenText = ko.observable();
	self.textsReadyToSend = ko.observableArray([]);
	self.changesAreSaved = ko.observable(true);
	self.chosenAreaExists = function () {
		return parseInt($("#image-overlay-1").css('width').split('px')) > 0;
	};
	self.textsReadyToSend.exist = function(id) {
		for (var i = 0; i < self.textsReadyToSend().length; i++) {
			if(self.textsReadyToSend()[i].id == id) {
				return 1;
			}
		}
		return -1;
	};

	self.turnEditableModeOn = function() {
		self.isEditingImgsData(true);
		localStorage.setItem('mode', 1);
	};
	self.turnEditableModeOff = function() {
		self.isEditingImgsData(false);
		localStorage.setItem('mode', 0);
	};
	// self.coordinatesOfChosenFragment = ko.observableArray();
	self.relationIsValid = ko.computed(function() {
		try {
			return !!self.chosenText().coordinates() &&
			!!self.chosenText().coordinates()['x_lt'] &&
			!!self.chosenText().coordinates()['y_lt'] &&
			!!self.chosenText().coordinates()['x_rb'] &&
			!!self.chosenText().coordinates()['y_rb'];
		} catch (e) {
			console.error('Coordinates are not set yet!');
			return false;
		}
	}, self);
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
		self.chosenText().imageId = self.activeImgPreview().id;
		// push text fragment back to allTexts
		// TODO: check if it has image and coordinates
		self.allTexts.unshift(self.chosenText()); //add element to the beginning of array
		// update chosenText
		var new_id;
		for (var i = 0; i < self.allTexts().length; i++) {
			if (self.allTexts()[i].hasImage() == false) {
				new_id = self.allTexts()[i].id;
				break;
			}
		}
        // change chosenTextId in localStorage
        if (new_id) { // TODO: check this!
        	localStorage.setItem('chosenTextId', new_id);
        	self.updateTexts();
        } else {
        	console.log('Adding data finished!');
        }
        resetSelectedFragment();

		// 2. Get new list of images and text fragments - ???? OR not to send the same data again?
    	//self.updateTexts();
		console.log("Setting relation...");
	};
	self.sendReadyTextFragments = function() {
		var textFragments = [];

		for (var i = 0; i < self.allTexts().length; i++) {
        	if (self.allTexts()[i].hasImage() == true) {
        		if (self.textsReadyToSend.exist(self.allTexts()[i].id) == -1) {
        			self.textsReadyToSend.push(self.allTexts()[i]); //new text fragment with image and coord
        		}
        	}
        };
        console.log(self.textsReadyToSend());
        for (var i = 0; i < self.textsReadyToSend().length; i++) {
        	var textFragmentInfo = {};
        	textFragmentInfo.image_id = self.textsReadyToSend()[i].imageId;
			textFragmentInfo.id = self.textsReadyToSend()[i].id
			textFragmentInfo.x_lt = self.textsReadyToSend()[i].coordinates()['x_lt'];
			textFragmentInfo.y_lt = self.textsReadyToSend()[i].coordinates()['y_lt'];
			textFragmentInfo.x_rb = self.textsReadyToSend()[i].coordinates()['x_rb'];
			textFragmentInfo.y_rb = self.textsReadyToSend()[i].coordinates()['y_rb'];
			textFragments.push(textFragmentInfo);
        }
        // send here
        if (self.textsReadyToSend().length > 0) {
			// $.post();
			self.waiter.show();
			console.log('Send to server...');
			var csrftoken = getCookie('csrftoken');
			$.post("fragments/set/", {csrfmiddlewaretoken: csrftoken, text_fragments: JSON.stringify(textFragments)}).then(function (resp) {
	            console.log(resp);
	            if(resp.length == 0) {
	                // TODO: handle it?
	            } else {
	            	for (var i = self.allTexts().length - 1; i >= 0; i--) {
	            		if(self.allTexts()[i].hasImage() == true) {
	            			self.allTexts.splice(i, 1);
	            		}
	            	}

	            	self.imgPreviews.removeAll();
	            	for (var i = 0; i < resp["previews"].length; i++) {
	                	self.imgPreviews.push(new Image(resp["previews"][i].id, resp["previews"][i].link_prev, resp["previews"][i].link_full, resp["previews"][i].fragments));
	                }
                	var activePreviewId = self.activeImgPreview().id;
                	for (var i = 0; i < self.imgPreviews().length; i++) {
                		self.imgPreviews()[i].isActive(false);
                	}
					for (var i = 0; i < self.imgPreviews().length; i++) {
						if (self.imgPreviews()[i].id == activePreviewId) {
							self.imgPreviews()[i].isActive(true);
							self.activeImgPreview(self.imgPreviews()[i]);
						}
					}

	                self.textsReadyToSend.removeAll();
	                if (self.chosenAreaExists()) {
	                	self.changesAreSaved(false);
	                } else {
	            		self.changesAreSaved(true);
	                }
	            	self.waiter.hide();
	            }
	        }).always(function () {
	        	// TODO: make success and fail callbacks
	        });
        } else {
        	console.log('Nothing to send...');
        }
	};
	var t = setInterval(self.sendReadyTextFragments, 30000);
}

function Image(id, linkPrev, linkFull, fragments) {

	var self = this;
	this.id = id;
	this.linkPrev = linkPrev;
	this.linkFull = linkFull;
	this.isActive = ko.observable(false);

	this.imgFragments = ko.observableArray(fragments);

	this.prepareFragments = function() {
		for (var i = 0; i < self.imgFragments().length; i++) {
			if (i > 0) {
				self.imgFragments()[i]['y_lt'] = parseInt(self.imgFragments()[i]['y_lt']) - parseInt(prev_y_lt);
			};
			var prev_y_lt = parseInt(self.imgFragments()[i]['y_lt']);
		}
	};
	this.setColors = function() {
		for (var i = 0; i < self.imgFragments().length; i++) {
			self.imgFragments()[i]['color'] = colors[i];
		}
	};
	this.setColors();
	// this.prepareFragments();

}

function TextFragment(id, author, description, hasImage) {
	this.id = id;
	this.imageId = null;
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

	$(document).on("click", ".image-preview", function(evt) {
		if(typeof(VM.activeImgPreview()) !== 'undefined' && bottom_right == 0 && evt.target.nodeName !== "BUTTON" && VM.isEditingImgsData() == true) {
			console.log(evt);
			var x_lt = evt.pageX;
			var y_lt = evt.pageY;
			var x_rb = evt.pageX - x_old;
			var y_rb = evt.pageY - y_old;
			if (!top_left) {
				// $("#image-background-1").html('');
				$("#image-overlay-1").css('left', x_lt);
				$("#image-overlay-1").css('top', y_lt);
				x_old = x_lt;
				y_old = y_lt;
				VM.chosenText().coordinates({'x_lt': x_lt, 'y_lt': y_lt});
				top_left = 1;
			} else {
				$("#image-overlay-1").css('width', x_rb);
				$("#image-overlay-1").css('height', y_rb);
				bottom_right = 1;
				var coord_lt = VM.chosenText().coordinates();
				VM.chosenText().coordinates(null);
				VM.chosenText().coordinates({'x_lt': coord_lt['x_lt'], 'y_lt': coord_lt['y_lt'],'x_rb': x_rb,'y_rb': y_rb});
				VM.changesAreSaved(false);
				console.log(VM.chosenText().coordinates());
				// TODO: handler of chosen area here!
				// VM.chosenAreaExists(true);
				// set coordinates to chosenText here, add button 'ok' anywhere near hear
			};
		};
	});

	$(document).on("click", "#image-overlay-1", resetSelectedFragment);
	$(window).resize(function() {
	
	});

	$(window).scroll(function() {
		
	});

    // $('body').on('keydown', function (evt) {
    //     if (evt.keyCode === 9) {
    //         var hasClass = $(document.activeElement).hasClass('enum');
    //         if(hasClass) {
    //             if (parseInt(document.activeElement.attributes.tabindex.nodeValue) === VM.orderUnits().length * 3) {
    //                 console.log("Copying last line..");
    //                 VM.copyLastOrderUnit();
    //             }
    //         }
    //     }
    // });
});