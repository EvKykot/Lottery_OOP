///////////////////////////////////
/////////////// APP ///////////////
///////////////////////////////////

function App( selector ) {
	this.domElem = selector ? selector : document.getElementById( 'myLotteryApp' );
	this.persons = [];
	this.appWrap = document.createElement( 'div' );
	this.appWrap.className = "appWrap";
};
App.prototype.init = function() {
	this.renderNewApp();
	this.createWinner();
	this.createForm();
};
App.prototype.renderNewApp = function() {
	this.domElem.appendChild( this.appWrap );
};
App.prototype.createWinner = function() {
	var App = this;
	this.winner = new Winner( App );

};
App.prototype.createForm = function() {
	var App = this;
	this.form = new Form( App );
};
App.prototype.createCustomEvent = function( nameVar, nameEvent, dataDetail, elem ) {
	var nameVar = new CustomEvent( nameEvent, {
		detail: dataDetail,
		bubbles: true,
		cancelable: true
	});
	elem.dispatchEvent( nameVar );
};
App.prototype.bindModeInput = function( obj, property, elem ) {
	Object.defineProperty( obj, property, {
		get: function() {
			return elem.value;
		},
		set: function( newValue ) {
			elem.value = newValue;
		},
		configurable: true
	});
};
App.prototype.randomBetween = function( from, to ) {
	var rand = from + Math.random( ) * ( to - from );
	rand = Math.round( rand );
	return rand;
};
App.prototype.saveInLocalStorage = function( obj ) {
	var serializObj = JSON.stringify( obj );
	localStorage.setItem( "myKey", serializObj );
};

App.prototype.takeFromLocalStorage = function() {
	return JSON.parse( localStorage.getItem("myKey") );
};

/////////////////////////////////////
/////////////// WINNER //////////////
/////////////////////////////////////

function Winner( App ) {
	this.App = App;
	this.winnerTemplate = document.getElementById( 'winnerTemplate' ).innerHTML;

	this.winnerBox = document.createElement('div');
	this.winnerBox.className = "winner";

	this.init();
};
Winner.prototype.init = function() {
	this.renderWinner();
	this.emitWinnerEvents();
	this.initWinnerEvents();
};
Winner.prototype.renderWinner = function() {
	this.App.appWrap.appendChild( this.winnerBox );

	Mustache.parse(this.winnerTemplate);
	var rendered = Mustache.render(this.winnerTemplate);
	this.winnerBox.innerHTML += rendered;
};
Winner.prototype.viewWinner = function() {

	var winnerBox = this.winnerBox.getElementsByClassName( 'winner-participant' )[ 0 ];

	if ( this.App.persons.length < 1 ) {
		alert( 'No participants. Sorry!;' );
	} else {
		var winnerNum = this.App.randomBetween( 0, this.App.persons.length - 1 );
		var winner = this.App.persons[ winnerNum ].name.val;
		winnerBox.innerHTML = '';
		winnerBox.innerHTML = winner;
	}
};
Winner.prototype.initWinnerEvents = function() {
	var self = this;
	this.winnerBox.addEventListener( 'click', function( event ) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		self.viewWinner();
	});
};
Winner.prototype.emitWinnerEvents = function() {
	var self = this;
	var buttonWinner = this.winnerBox.getElementsByClassName( 'js-perform-lottery' )[0];

	buttonWinner.addEventListener( 'click', function( event ){
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		self.App.createCustomEvent( 'viewWinner', 'viewWinner', '', self.winnerBox );
	});
};
///////////////////////////////////
/////////////// FORM //////////////
///////////////////////////////////

function Form( App ) {
	this.App = App;

	

	this.formTemplate = document.getElementById( 'formTemplate' ).innerHTML;
	this.outputFormTemplate = Mustache.render( this.formTemplate );

	this.personsListTemplate = document.getElementById( 'personsListTemplate' ).innerHTML;
	this.outputPersonsListTemplate = Mustache.render(this.personsListTemplate);

	this.formWrap = document.createElement( 'div' );
	this.formWrap.className = "formWrap";

	this.personsListWrap = document.createElement( 'div' );
	this.personsListWrap.className = "personsListWrap participants";

	this.personsList = document.createElement('div');
	this.personsList.className = "js-participants";

	this.inputValues = {		
		"name": {
			valid: false,
			regExp: /^[a-zA-Z'][a-zA-Z-' ]+[a-zA-Z']+[А-Яа-яЁё' ]?$/,
			messages: {
				ok: '',
				error: 'Sorry, please fill your name correctly! Without numbers, only roman letters!',
				empty: 'Please write your name!',
			}
		},
		"surname": {
			valid: false,
			regExp: /^[a-zA-Z'][a-zA-Z-' ]+[a-zA-Z']+[А-Яа-яЁё' ]?$/,
			messages: {
				ok: '',
				error: 'Sorry, please provide your surname correctly!',
				empty: 'Please write your surname!',
			}
		},
		"email": {
			valid: false,
			regExp: /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i,
			messages: {
				ok: '',
				error: 'Sorry, but the specified e-mail address is invalid!',
				empty: 'Please fill the field of e-mail addresses!',
			}
		},
		"phone": {
			valid: false,
			regExp: /^\d+$/,
			messages: {
				ok: '',
				error: 'Please fill in the field of contact numbers! Enter your phone only numbers without spaces and without "+"!',
				empty: 'Please fill in the field of contact numbers! Enter your phone only numbers, no spaces!',
			}
		},
		errorText: ''
	};
	this.init();
};
Form.prototype.init = function() {
	this.renderForm();
	this.renderPersonListTemplate();
	this.createPerson();
	this.emitFormEvents();
	this.initFormEvents();
};
Form.prototype.renderForm = function() {
	this.App.appWrap.appendChild( this.formWrap );
	this.formWrap.innerHTML += this.outputFormTemplate;
};
Form.prototype.renderPersonListTemplate = function() {
	this.formWrap.appendChild( this.personsListWrap );
	this.personsListWrap.innerHTML += this.outputPersonsListTemplate;
	this.personsListWrap.appendChild( this.personsList );
};
Form.prototype.invisiblePropertyInCycle = function(object, property) {
	Object.defineProperty(object, property, {
		enumerable: false,
		writable: true
	});
};
Form.prototype.validate = function(obj) {
	var inputValue = obj.val;		
	var name = obj.elem.getAttribute('name');
	var elemRegExp = this.inputValues[ name ].regExp;
	if ( inputValue != '' ) {
		if ( elemRegExp.test( inputValue ) ) {
			obj.elem.classList.remove( 'worning' );
			obj.valid = true;
		} else {
			obj.elem.classList.add( 'worning' );
			this.inputValues.errorText += this.inputValues[ name ].messages.error + "\n";
			obj.valid = false;		
		}
	} else {
		obj.elem.classList.add( 'worning' );
		this.inputValues.errorText += this.inputValues[ name ].messages.empty + "\n";
		obj.valid = false;
	}	
};
Form.prototype.initValidateEvent = function(obj) { 
	for ( var inputName in obj ) {
		this.validate( obj[ inputName ] );
	}
	var flag = false;
	for ( var inputName in obj ) {
		if ( !obj[ inputName ].valid ) {
			alert(this.inputValues.errorText);
			this.inputValues.errorText = '';
			return false;
		}
	}
	flag = true;
	return flag;
};
Form.prototype.createPerson = function() {
	this.personsList.innerHTML = '';
	if ( localStorage.getItem( "myKey" ) ) {
		this.App.persons = this.App.takeFromLocalStorage();
	}
	for ( var i = 0; i < this.App.persons.length; i++ ) {
		this[ "person"+i ] = new Person( this.App, this, this.App.persons[ i ], i );
	}
};
Form.prototype.addPerson = function( person ) {
	if ( !this.initValidateEvent( person ) ) {
		return false
	}
	this.App.persons.push( person );
	this.App.saveInLocalStorage( this.App.persons );

	var inputPlase = this.formWrap.getElementsByClassName('input-val');
	for (var i = 0; i < inputPlase.length; i++) {
		inputPlase[i].value = ('');
	}
};
Form.prototype.initFormEvents = function() {
	var self = this;
	this.formWrap.addEventListener( 'addPerson', function( event ){	
		self.addPerson( event.detail );
		self.createPerson();
	}, false);
};
Form.prototype.emitFormEvents = function() {
	var selfApp = this.App;
	var self = this;

	this.formWrap.addEventListener( 'click', function( event ){
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		
		var target = event.target;
		var action = target.getAttribute( 'data-action' );

		self.invisiblePropertyInCycle( self.inputValues, "errorText" );
		var person = { };
		for ( var inputName in self.inputValues ) {
			var inputElem = selfApp.appWrap.querySelectorAll( 'input[name="' + inputName + '"]' )[ 0 ];
			person[ inputName ] = {
				val: inputElem.value,
				elem: inputElem
			}
		}

		switch( action ) {
			case 'addPerson':
				selfApp.createCustomEvent( 'addPerson', 'addPerson', person, self.formWrap );
			default: return;
		};

	});
};

/////////////////////////////////////
/////////////// PERSON //////////////
/////////////////////////////////////


function Person( App, Form, object, i ) {
	this.Form = Form;
	this.App = App;

	this.person = object;

	this.number = i;
	this.personName = "person"+this.number;

	this.personTemplate = document.getElementById('personTempalate').innerHTML;

	this.personWrap = document.createElement('ul');
	this.personWrap.className = "participant";

	this.init();
};
Person.prototype.init = function() {
	this.renderPerson();
	this.initPersonEvents();
	this.emitPersonEvents();
};
Person.prototype.renderPerson = function() {
	selfApp = this.App;
	var self = this;

	this.Form.personsList.appendChild(this.personWrap);

	Mustache.parse(this.personTemplate);
	var rendered = Mustache.render(this.personTemplate, {
		name: this.person.name.val, 
		surname: this.person.surname.val,
		email: this.person.email.val,
		phone: this.person.phone.val
	});
	this.personWrap.innerHTML += rendered;
};
Person.prototype.editPerson = function() {
	var someInput = this.personWrap.getElementsByTagName('input');
	for (var i = 0; i < someInput.length; i++) {
	    var input = someInput[i];
	    input.removeAttribute('readonly');
	}
};
Person.prototype.saveEdit = function() {
	var self = this;
	var someInput = this.personWrap.getElementsByTagName('input');

	for ( var objName in self.App.persons[ self.number ] ) {
		var inputElem = this.personWrap.getElementsByClassName( ''+ objName +'' )[0];
		self.App.persons[ self.number ][objName].val = inputElem.value;
		self.App.persons[ self.number ][objName].elem = inputElem;
	}

	if ( !self.Form.initValidateEvent( self.App.persons[ self.number ] ) ) {
		return false
	}

	this.App.saveInLocalStorage( this.App.persons );
	for (var i = 0; i < someInput.length; i++) {
	    var input = someInput[i];
	    input.setAttribute('readonly', 'readonly');
	}

};
Person.prototype.cancelEdit = function() {
	var someInput = this.personWrap.getElementsByTagName('input');
	for (var i = 0; i < someInput.length; i++) {
	    var input = someInput[i];
	    input.removeAttribute('readonly');
	}
	this.Form.createPerson();
};
Person.prototype.deletePerson = function() {
	this.App.persons.splice(this.number, 1);
	this.App.saveInLocalStorage( this.App.persons );
	this.Form.createPerson();
};
Person.prototype.initPersonEvents = function() {
	var self = this;
	this.personWrap.addEventListener( 'editPerson', function( event ){	
		self.editPerson();
	}, false);
	this.personWrap.addEventListener( 'saveEdit', function( event ){	
		self.saveEdit();
	}, false);
	this.personWrap.addEventListener( 'cancelEdit', function( event ){	
		self.cancelEdit();
	}, false);
	this.personWrap.addEventListener( 'deletePerson', function( event ){	
		self.deletePerson();
	}, false);
};
Person.prototype.emitPersonEvents = function() {
	var self = this;

	var buttonEditPerson = this.personWrap.getElementsByClassName( 'editParticipant' )[0],
		buttonSaveEdit = this.personWrap.getElementsByClassName( 'saveEdit' )[0],
		buttonCancelEdit = this.personWrap.getElementsByClassName( 'cancelEdit' )[0],
		buttonDeletePerson = this.personWrap.getElementsByClassName( 'remove' )[0];

	buttonEditPerson.addEventListener( 'click', function( event ){
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		selfApp.createCustomEvent( 'editPerson', 'editPerson', '', self.personWrap );
	});
	buttonSaveEdit.addEventListener( 'click', function( event ){
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		selfApp.createCustomEvent( 'saveEdit', 'saveEdit', '', self.personWrap );
	});
	buttonCancelEdit.addEventListener( 'click', function( event ){
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		selfApp.createCustomEvent( 'cancelEdit', 'cancelEdit', '', self.personWrap );
	});
	buttonDeletePerson.addEventListener( 'click', function( event ){
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		selfApp.createCustomEvent( 'deletePerson', 'deletePerson', '', self.personWrap );
	});

};
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////// launch //////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////


var app = new App();
app.init();