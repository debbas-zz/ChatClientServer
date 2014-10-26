/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var ChatAppDispatcher = require('../dispatcher/ChatAppDispatcher');
var ChatConstants = require('../constants/ChatConstants');
var ChatMessageUtils = require('../utils/ChatMessageUtils');
var EventEmitter = require('events').EventEmitter;
var ThreadStore = require('../stores/ThreadStore');
var UserStore = require('../stores/UserStore');

var merge = require('react/lib/merge');

var ActionTypes = ChatConstants.ActionTypes;
var CHANGE_EVENT = 'change';

//var socket = localStorage.getItem('socket');

var socket = io();
var username = 	UserStore.getCurrentID();

var _messages = {};


function _addMessages(rawMessages) {
  rawMessages.forEach(function(message) {
    if (!_messages[message.id]) {
      _messages[message.id] = ChatMessageUtils.convertRawMessage(
        message,
        ThreadStore.getCurrentID()
      );
    }
  });
}

function _markAllInThreadRead(threadID) {
  for (var id in _messages) {
    if (_messages[id].threadID === threadID) {
      _messages[id].isRead = true;
    }
  }
}


var MessageStore = merge(EventEmitter.prototype, {

	getInitialState: function(){
		socket.on('login', this.login);
		socket.on('new message', this.messageRecieve);
		socket.on('user joined', this.userJoined);
		socket.on('user left', this.userLeft);

		return {users: [], messages:[], text: ''};
	},
	

	login: function(data){
		var message = "Welcome to Debbas Chat!! ";
		console.log(message);
		//this.addChatMessage(data);
	},
	
	messageRecieve: function(data){
		console.log("MSG receieved");
		console.log(data.message);
		addChatMessage(data.message);
	},
	
	userJoined: function(data){
		console.log(data);
		var timestamp = Date.now();
  		var msg = {
      		id: 'm_' + timestamp,
      		threadID: ThreadStore.getCurrentID(),
      		authorName: 'Server', // hard coded for the example
      		date: new Date(timestamp),
      		text: data.username + " joined",
      		isRead: true
    	};
    	addChatMessage(msg);
	},
	
	
	userLeft: function(data){
		console.log(data);
		var timestamp = Date.now();
  		var msg = {
      		id: 'm_' + timestamp,
      		threadID: ThreadStore.getCurrentID(),
      		authorName: 'Server', // hard coded for the example
      		date: new Date(timestamp),
      		text: data.username + " left",
      		isRead: true
    	};
    	addChatMessage(msg);
	},
	
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  get: function(id) {
    return _messages[id];
  },

  getAll: function() {
    return _messages;
  },

  /**
   * @param {string} threadID
   */
  getAllForThread: function(threadID) {
    var threadMessages = [];
    for (var id in _messages) {
      if (_messages[id].threadID === threadID) {
        threadMessages.push(_messages[id]);
      }
    }
    threadMessages.sort(function(a, b) {
      if (a.date < b.date) {
        return -1;
      } else if (a.date > b.date) {
        return 1;
      }
      return 0;
    });
    return threadMessages;
  },

  getAllForCurrentThread: function() {
    return this.getAllForThread(ThreadStore.getCurrentID());
  },

  getCreatedMessageData: function(text) {
  
    var timestamp = Date.now();
    return {
      id: 'm_' + timestamp,
      threadID: ThreadStore.getCurrentID(),
      authorName: "test",
      date: new Date(timestamp),
      text: text,
      isRead: true
    };
    
    
  }

});


function addChatMessage(message) {
	_messages[message.id] = message;
	MessageStore.emitChange();

}

MessageStore.dispatchToken = ChatAppDispatcher.register(function(payload) {

  MessageStore.getInitialState();

  var action = payload.action;
	
	
  switch(action.type) {

    case ActionTypes.CLICK_THREAD:
      ChatAppDispatcher.waitFor([ThreadStore.dispatchToken]);
      _markAllInThreadRead(ThreadStore.getCurrentID());
      MessageStore.emitChange();
      break;

    case ActionTypes.CREATE_MESSAGE:
      var message = MessageStore.getCreatedMessageData(action.text);
      _messages[message.id] = message;
            socket.emit('new message', message);
      MessageStore.emitChange();
      break;

    case ActionTypes.RECEIVE_RAW_MESSAGES:
      _addMessages(action.rawMessages);
      ChatAppDispatcher.waitFor([ThreadStore.dispatchToken]);
      _markAllInThreadRead(ThreadStore.getCurrentID());
      MessageStore.emitChange();
      break;

    default:
      // do nothing
  }

});



module.exports = MessageStore;
