
import React from 'react';
import { Avatar } from 'material-ui';
import MentionsWrapper from './mentions-wrapper';

import actions from './actions/Comment.action';

const PostComment = React.createClass({
    propTypes: {
        currentUser: React.PropTypes.object,
        interpretationId: React.PropTypes.string,
        postCommentSuccess: React.PropTypes.func,
    },

    getInitialState() {
        return {
            text: '',
        };
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    _addComment() {
        if (this.state.text !== '') {
            actions.addComment(this.props.interpretationId, this.state.text)
                        .subscribe(() => {
                            this.props.postCommentSuccess();
                            this.setState({ text: '' });
                        });
        }
    },

    _onChange(e) {
        this.setState({ text: e.target.value });
    },

    _onTextChange(text) {
        this._onChange({ target: { value: text } });
    },

    render() {
        const { d2 } = this.context;
        const userName = this.props.currentUser.name.split(' ');
        let initChars = userName[0][0];
        if (userName.length > 1) {
            initChars += userName[userName.length - 1][0];
        }

        const postComentTagId = `postComent_${this.props.interpretationId}`;
        const style = { fontSize: 15, fontWeight: 'bold' };

        return (

			<div className="postComment greyBackground" id={postComentTagId} >
				<table>
                    <tbody>
                        <tr>
                            <td>
                                <Avatar color="black" size={32} style={style}>{initChars}</Avatar>
                            </td>
                            <td>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <MentionsWrapper d2={d2} onUserSelect={this._onTextChange}>
                                                    <textarea className="commentArea" placeholder="Add a comment..." value={this.state.text} onChange={this._onChange} />
                                                </MentionsWrapper>
                                                <br />
                                                <a onClick={this._addComment}>Share your comment</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
				</table>
			</div>
		);
    },

});


export default PostComment;

