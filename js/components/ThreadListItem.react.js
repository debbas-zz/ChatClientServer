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
 *
 * @jsx React.DOM
 */

var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators');
var React = require('react');
var cx = require('react/lib/cx');

var ReactPropTypes = React.PropTypes;

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string
  },

  render: function() {
    var thread = this.props.thread;
    return (
      <li
        className={cx({
          'thread-list-item': true,
          'active': thread.id === this.props.currentThreadID
        })}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.name}</h5>
      </li>
    );
  },

  _onClick: function() {
    ChatThreadActionCreators.clickThread(this.props.thread.id);
  }

});

module.exports = ThreadListItem;
