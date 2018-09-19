/**
	TODO:
		SVG Icons
			Add icons
			Morph icons

**/

/* Test */


var state, controlPanel, select, infoBox;
var curPage = 0, time, pageTime = 0, sesTime = 0;
var prevIndex;
var elements;

var pause = new Button(function(){
	setState("paused");
}, "pause", "btn-light control-button", "Pause", "pause");

var play = new Button(function(){
	error = validateIntervals();
	if(error === false){
		setState("playing");
		if(controlPanel.beginPage == undefined){
			curPage = -10000;
		}else{
			curPage = controlPanel.beginPage - 1;
		}
		nextPage();
		updateInfoBox();
		controlPanel.disableFields = true;
		updateProgressBars();
	}else{
		alert(error);
	}
}, "play", "btn-success control-button", "Play", "play");

var stop = new Button(function(){
	setState("initial");
	resetProgressBars();
	controlPanel.disableFields = false;
	controlPanel.beginPage = curPage;
}, "stop", "btn-danger control-button", "Stop", "stop");

var split = new Button(function(){
	controlPanel.selectedBook.times[curPage] = pageTime/1000;
	if(controlPanel.liveTime) elements['subtimer'].text(getTimeString(pageTime/1000));
	else{
		if(elements['timer'].text() != '0:00') elements['subtimer'].text(elements['timer'].text().slice(0,-3))
		elements['timer'].text(getTimeString(pageTime/1000, true));
	}
	if (!nextPage()){
		stop.ability();
		return;
	}
	updateInfoBox();
	localStorage.setItem('books', JSON.stringify(controlPanel.books));
}, "split", "btn-light control-button", "Split", "split");

var resetPageTime = new Button(function(){
	controlPanel.selectedBook.times = {};
	updateInfoBox();
}, "resetPageTime", "btn-warning control-button", "Reset Average Time", "repeat");

var resume = new Button(function(){
	setState("playing");
}, "resume", "btn-light control-button", "Resume", "play");


var availableButtons = {
	play: play,
	pause: pause,
	stop: stop,
	resetPageTime: resetPageTime,
	resume: resume,
	split: split
};

var states = {
	initial: new State("initial", ["play"], [["pause", "play"]]),
	playing: new State("playing", ["split", "pause", "resetPageTime", "stop"], [["play", "split"], ["resume", "pause"]]),
	paused: new State("paused", ["split", "resume", "resetPageTime", "stop"], [["pause", "resume"]])
}

function Button(ability, tag, classes, buttonLabel, icon = null){
	this.tag = tag;
	this.ability = ability;
	this.icon = icon;
	this.classes = classes;
	this.buttonLabel = buttonLabel;
}

function State(tag, buttons, morphs = []){
	this.tag = tag;
	this.morphs = morphs;
	this.buttons = buttons;
}

function Book(tag, intervals = []){
	this.tag = tag;
	this.intervals = intervals;
	this.times = {};
	this.page = 0;
}

function updateInfoBox(){
	// Average time
	if(controlPanel.selectedBook != null && Object.values(controlPanel.selectedBook.times).length > 0){
		infoBox.avgTime = Object.values(controlPanel.selectedBook.times).concat([0]).reduce((v1, v2) => v1 + v2)/Object.values(controlPanel.selectedBook.times).length;
		console.log(infoBox.avgTime);
	}else{
		infoBox.avgTime = null;
	}
	// Current page
	infoBox.curPage = curPage;
	// Estimated time
	infoBox.estTime = infoBox.avgTime*controlPanel.countPages(curPage);
	// ETA
	let today = new Date();
	let finishedDate = new Date(today.getTime() + infoBox.estTime*1000);
	infoBox.eta = finishedDate.getHours() + ":" + ("0" + finishedDate.getMinutes()).slice(-2);
}

function nextPage(){
	let firstInterval = controlPanel.selectedBook.intervals.find(i => i[1] > curPage);
	if (firstInterval == undefined){
		// Finished reading
		console.log("Finished reading");
		controlPanel.beginPage = null;
		// Reset progressbars
		updateInfoBox();
		infoBox.updatePagesRead(true);
		curPage = controlPanel.selectedBook.intervals[0][0];
		controlPanel.selectedBook.page = curPage;
		return false;
	}
	if(curPage < firstInterval[0]){
		curPage = firstInterval[0];
	}else{
		curPage++;
	}
	pageTime = 0;
	// Update progress bars
	updateProgressBars();
	return true;
}

function resetProgressBars(all = false){
	if(all){
		controlPanel.books.forEach(b => b.intervals.forEach(i => i[3] = 0.0));
	}else{
		controlPanel.selectedBook.intervals.forEach(i => i[3] = 0.0);
	}
}

function updateProgressBars(){
	console.log(curPage);
	controlPanel.selectedBook.intervals.forEach(i => i[3] = (curPage >= i[0]) ? ((curPage <= i[1]) ? ((curPage - i[0] + 1)/(i[1] - i[0] + 1)) : 1) : 0);
	console.log("Updated progressbars");
	controlPanel.disableFields = false;
	controlPanel.disableFields = true;
	console.log(controlPanel.selectedBook.intervals);
}

function setState(stateName){
	// Get state to change to
	let newState = states[stateName];
	let morphs = [];
	if(state != null){
		$(".control-button").remove();
	}
	let toAdd = newState.buttons;
	for (let a of toAdd){
		addButton(a);
	}
	// Set current state to the new state
	state = newState;
}

function addButton(b, before=false){
	let button = availableButtons[b];
	let bElement = $("<button></button"); //'<button type="button" id="' + b.tag + '" class="btn ' + b.classes + '"></button>';
	bElement.attr({
		id: button.tag,
		type: "button",
		class: "btn " + button.classes
	});
	/* Icon
	if(button.icon != null){
		bElement.append(getIconElement(button.icon));
	}*/
	bElement.append(button.buttonLabel);
	bElement.click(button.ability);
	if(before){
		elements['buttonDiv'].prepend(bElement);
	}else{
		elements['buttonDiv'].append(bElement);
	}

}

function getIconElement(iconName){
	let icon = $("<img></img>");
	icon.attr({
		src: button.icon + ".svg",
		class: "svg-icon svg-baseline"
	});
	return icon;
}

function removeButton(buttonId){
	$("#"+buttonId).remove();
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function morphButton(morphFrom, morphTo){
	let element = $("#"+morphFrom);
	let fromButton = availableButtons[morphFrom];
	let toButton = availableButtons[morphTo];
	element.attr({
		id: toButton.tag,
		class: "btn " + toButton.classes
	});
	element.text(toButton.buttonLabel);
	element.click(toButton.ability);
	// Icon morphing
}

function bookChange(select){
	if(select.selectedIndex < select.options.length - 1){
		// Select a new book
	}
}

function selectBook(select, bookName){
	let opts = select.options;
	for (let opt, j = 0; opt = opts[j]; j++) {
	  if (opt.value == bookName) {
	    select.selectedIndex = j;
	    break;
	  }
	}
}

function addBookHandler(){
	let input = prompt("Book name to add: ");
	if(input != "" && input != 0 && input != null){
		if(!controlPanel.books.map(b => b.tag).includes(input)){
			addBook(input);
			controlPanel.selected = input;
			//selectBook(select, input);
		}
		else{
			alert("Book name is already registered!");
		}
	}
}

function removeBookHandler(){
	if(!confirm("Are you sure you want to remove book " + '"' + controlPanel.selected + '"?')){
		return;
	}
	controlPanel.books.splice(controlPanel.books.findIndex(b => b.tag == controlPanel.selected), 1);
	controlPanel.selected = '';
	controlPanel.selectedBook = null;
}

function addBook(bookName){
	controlPanel.books.push(new Book(bookName));
	controlPanel.books.sort((a, b) => a.tag < b.tag ? -1 : a.tag > b.tag);
}

function renameBookHandler(){
	let input = prompt("New book name for " + '"' + controlPanel.selected + '": ');
	if(input == null || input == ''){
		return;
	}
	controlPanel.selectedBook.tag = input;
	controlPanel.selected = input;
}

function init(){
	elements = {
		timer: $("#timer"),
		subtimer: $("#subtimer"),
		avgTime: $("#avg-time"),
		estTime: $("#est-time"),
		curPage: $("#cur-page"),
		buttonDiv: $("#button-div")
	};
	setState("initial");
	updateTime();
	setInterval(updateTime, 1000/60);
	controlPanel = new Vue({
		el: "#control-panel",
		data: {
			books: [],
			selected: '',
			intervals: [],
			selectedBook: null,
			disableFields: false,
			beginPage: null,
			liveTime: true
		},
		watch: {
			selected: function(value){
				if(value != ''){
					this.selectedBook = this.books.find(b => b.tag == value);
					this.beginPage = this.selectedBook.page;
					$("#play").prop("disabled", false);
				}else{
					$("#play").prop("disabled", true);
					updateInfoBox();
				}
				localStorage.setItem('selected', JSON.stringify(value));
			},
			books: {
				handler: function(value){
					localStorage.setItem('books', JSON.stringify(value));
				},
				deep: true
			},
			selectedBook: {
				handler: function(value){
					if(value != null){
						this.intervals = value.intervals;
					}
					else{
						this.intervals = [];
					}
				}, deep: true
			},
			liveTime: function(value){
				if(!value){
					elements['subtimer'].text('');
					elements['timer'].text(getTimeString(0));
				}else{

				}
			}
		},
		computed: {
			getSelectImage: function(idx){
				if($.inArray(intervals[idx], selectedIntervals) == -1){
					return "unchecked.png";
				}else{
					return "checked.png";
				}
			}
		},
		methods:{
			addInterval: function(){
				if(this.disableFields){
					return;
				}
				this.selectedBook.intervals.push([null, null, false, 0]);
			},
			removeInterval: function(idx){
				if(this.disableFields){
					return;
				}
				this.selectedBook.intervals.splice(idx, 1);
			},
			validateIntervalInput: function(event, interval, idx){
				if(interval[0] == null || interval[1] == null){
					return;
				}
				if(interval[0] > interval[1]){
					interval[2] = true;
				}else{
					interval[2] = false;
				}
				sortIntervals();
			},
			countPages: function(from){
				if(this.intervals.length == 0)
					return 0;
				// Call with no argument to count all
				if(from == undefined){
					let pages = 0;
					this.intervals.forEach(i => pages += i[1] - i[0] + 1);
					return pages;
				}
				let i = 0;
				let pages = 0;
				for(; i < this.intervals.length; i++){
					if(this.intervals[i][0] <= from && this.intervals[i][1] >= from){
						break;
					}
				}
				if(this.intervals[i] != undefined)
					pages += this.intervals[i][1] - (from > this.intervals[i][0] ? from : this.intervals[i][0]) + 1;

				for(i++; i < this.intervals.length; i++){
					pages += this.intervals[i][1] - this.intervals[i][0] + 1;
				}
				return pages;
			}
		}
	});

	infoBox = new Vue({
		el: '#info-box',
		data: {
			curPage: null,
			avgTime: null,
			estTime: null,
			sesTime: null,
			pagesRead: null,
			eta: null
		},
		computed: {
			currentPage: function(){
				return this.curPage;
			},
			averageTime: function(){
				return getTimeString(this.avgTime, true);
			},
			estimatedTime: function(){
				return getTimeString(this.estTime, false, true);
			},
			sessionTime: function(){
				return getTimeString(this.sesTime);
			}
		},
		methods: {
			updatePagesRead: function(finished = false){
				let total = controlPanel.countPages();
				let read = finished ? total : total - controlPanel.countPages(curPage);
				this.pagesRead = ""+read+"/"+total+" (" + (total ? read*100/total : 0).toFixed(2) + "%)";
			}
		},
		watch: {
			curPage: function(value){
				this.updatePagesRead();
				if(controlPanel.selectedBook != null){
					controlPanel.selectedBook.page = value;
				}
			}
		}

	});

	// Load local storage
	let localBooks = JSON.parse(localStorage.getItem('books'));
	let localCurPage = JSON.parse(localStorage.getItem('curPage'));
	let localSelected = JSON.parse(localStorage.getItem('selected'));
	if(localBooks != null) controlPanel.books = localBooks;
	if(localSelected != null) controlPanel.selected = localSelected;

	if(controlPanel.books){
		resetProgressBars(true);
	}

	if(controlPanel.selected == ''){
		$("#play").prop("disabled", true);
	}
	select = document.getElementsByClassName("book-drop-down")[0];
	window.onkeydown = function(event){
	    if(event.keyCode === 32) {
	        event.preventDefault();
	    }
	};
	document.addEventListener('keydown', function(event) {
		// P
		if(event.keyCode == 80) {
			if(state.tag == "initial" && !$("#play").prop("disabled")){
				play.ability();
			}else if(state.tag == "playing"){
				pause.ability();
			}else if(state.tag == "paused"){
				resume.ability();
			}
		}
		// Space
		else if(event.keyCode == 32) {
			if(state.tag == "initial" && !$("#play").prop("disabled")){
				play.ability();
			}else if(state.tag == "playing" || state.tag == "paused"){
				split.ability();
			}
		}
		else if(event.keyCode == 32) {
			if(state.tag == "initial" && !$("#play").prop("disabled")){
				play.ability();
			}else if(state.tag == "playing" || state.tag == "paused"){
				split.ability();
			}
		}
	});
	$(".load-hide").css({visibility: "visible"});
}

function validateIntervals(){
	if(controlPanel.intervals == null || controlPanel.intervals.length == 0){
		return "Book must contain one or more intervals."
	}
	for(let i = 0; i < controlPanel.intervals.length; i++){
		if(controlPanel.intervals[i][0] === null || controlPanel.intervals[i][1] === null){
			return "Interval boundaries may not be empty.";
		}
		if(controlPanel.intervals[i][0] > controlPanel.intervals[i][1]){
			return "Intervals must be from a lower a higher page number (offender: interval no. " + (i+1) + ").";
		}
	}
	return false;
}

function sortIntervals(){
	controlPanel.intervals.sort((i1, i2) => i1[0] - i2[0]);
}

function updateTime(){
	let newTime = new Date().getTime();
	if(state.tag == "playing"){
		pageTime += newTime - time;
		sesTime += newTime - time;
		if(controlPanel.liveTime) elements['timer'].text(getTimeString(pageTime/1000, true));
	}
	time = newTime;
}

function getTimeString(time, withDecimal = false, hours = false){
	if(time == null){
		return "";
	}
	return "" + (hours ? (Math.floor(time/3600) + ":" ): "") + (hours ? ("0" + Math.floor((time/60)%60)).slice(-2) : Math.floor(time/60)) + ":" + ("0" + Math.floor(time%60)).slice(-2) + (withDecimal ? (time%1).toFixed(2).slice(-3):"");
}


$(document).ready(init);
