<!DOCTYPE html>
<html>
<head>
	<title>Reading Tool</title>
	<link rel="icon" href="favicon2.png" sizes="16x16 32x32" type="image/png">
	<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" />
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="styles.css"></style>
    <script type="text/javascript" src="reader.js"></script>
</head>
<body>
	<div class="content">
		<p id="timer-paragraph" class="load-hide"><span id="timer">0:00</span> <span id="subtimer"></span></p>
		<div id="button-div">
			<!--button type="button" class="btn"></button>
			<button type="button" class="btn"></button-->
		</div>
		<div id="info-box" v-cloak>
			<p class="info-box">
				<span class="info-title">Current page: </span> <span v-cloak class="info-value" id="cur-page">{{currentPage}}</span>
				<span class="info-title">Progress: </span> <span v-cloak class="info-value" id="ps-read">{{pagesRead}}</span>
				<span class="info-title">Avg. page time: </span> <span v-cloak class="info-value" id="avg-time">{{averageTime}}</span>
				<span class="info-title">Est. time remaining: </span> <span v-cloak class="info-value" id="est-time">{{estimatedTime}}</span>
				<span class="info-title">ETA: </span> <span v-cloak class="info-value" id="eta">{{eta}}</span>
			</p>
		</div>
		<div v-cloak id="control-panel">
			<div class="book-drop-down-container">
				<select class="book-drop-down" v-model="selected" onchange="bookChange(this)" :disabled="disableFields == 1">
					<option v-cloak v-for="book in books" v-bind:val="book.tag"> {{book.tag}} </option>
				</select>
			</div>
			<button type="button" class="btn" id="add-book" :disabled="disableFields == 1" onclick="addBookHandler()">Add Book</button>
			<button type="button" v-if="selected" class="btn btn-warning" id="rename-book" :disabled="disableFields == 1" onclick="renameBookHandler()">Rename Book</button>
			<button type="button" v-if="selected" class="btn btn-danger" id="remove-book" :disabled="disableFields == 1" onclick="removeBookHandler()">Remove Book</button>
			<div style="overflow: auto;">
				<div id="page-control">
					<p>Begin on page</p>
					<input type="number" class="begin-field form-control" min="1" step="1" v-model.number="beginPage" :disabled="disableFields == 1"/>
				</div>
				<div id="live-timer">
					<label class="checkbox-inline">Live timer <input type="checkbox" v-model="liveTime" checked id="live-checkbox"></label>
				</div>
			</div>
			<p id="interval-title" v-if="selected">
				Intervals:
			</p>
			<ul class="list-group interval-list">
				<li class="list-group-item interval-list-item" v-for="(interval, idx) in intervals">
					<div class="interval-progress" :style="{ transform: 'scaleX(' + interval[3] + ')' }"></div>
					<input type="number" class="intervalField form-control" min="1" step="1" v-model.number="interval[0]" v-on:blur="validateIntervalInput($event, interval, 0)" :disabled="disableFields == 1" v-bind:class="{'is-invalid':interval[2]}"/>
					<input type="number" class="intervalField form-control" min="1" step="1" v-model.number="interval[1]" v-on:blur="validateIntervalInput($event, interval, 1)" :disabled="disableFields == 1" v-bind:class="{'is-invalid':interval[2]}"/>
					<img v-bind:class="{greyed: disableFields}" class="remove-icon" src="remove.png" v-on:click="removeInterval(idx)" data-toggle="tooltip" data-placement="top" title="Delete interval"></img>
				</li>
				<li class="list-group-item" v-bind:class="{disabled: disableFields}" v-if="selected" id="add-interval-item" v-on:click="addInterval">
					<p class="list-text" v-bind:class="{disabled: disableFields}">Add interval...</p>
				</li>
			</ul>
		</div>
	</div>
</body>
</html>
