import React from 'react';
import { IntlProvider, FormattedRelative } from 'react-intl';
import { Parser as RichTextParser } from '@dhis2/d2-ui-rich-text';
import { Avatar } from 'material-ui';

import MentionsWrapper from './mentions-wrapper';
import { otherUtils } from './utils';
import actions from './actions/Comment.action';
import { getShortText } from '../utils/content';
import Actions from './Actions.component';

const Comment = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        created: React.PropTypes.string,
        user: React.PropTypes.string,
        currentUser: React.PropTypes.object,
        interpretationId: React.PropTypes.string,
        interpretationAccess: React.PropTypes.object,
        deleteCommentSuccess: React.PropTypes.func,
        onReply: React.PropTypes.func,
    },

    styles: {
        avatar: { fontSize: 15, fontWeight: 'bold' },
        textParser: { display: "inline", whiteSpace: "pre-line", overflowWrap: "break-word" },
    },

    getInitialState() {
        return {
            text: this.props.data.text,
            showAllText: false,
            editMode: false,
        };
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    _reply() {
        this.props.onReply && this.props.onReply(this.props.data);
    },

    _deleteHandler() {
        actions.deleteComment(this.props.interpretationId, this.props.data.id)
			.subscribe(() => {
                this.props.deleteCommentSuccess(this.props.data.id);
		    });
    },

    _showEditHandler() {
        this.setState({ editMode: true, editText: this.state.text });
    },

    _handleClick(e) {
        this.setState({ showAllText: true });
    },

    _onChange(e) {
        this.setState({ editText: e.target.value });
    },

    _onTextChange(text) {
        this._onChange({ target: { value: text } });
    },

    _editCommentText() {
        const editText = this.state.editText;

        actions.editComment(this.props.interpretationId, this.props.data.id, editText)
			.subscribe(() => {
                this.setState({ text: editText, editMode: false });
            });
    },

    _cancelCommentText() {
        this.setState({ editMode: false });
    },

    render() {
        const { d2 } = this.context;
        const { data } = this.props;
        const { text, showAllText, editMode, editText } = this.state;

        const created = data.created.substring(0, 10).split('-');
        const time = data.created.substring(11, 19).split(':');
        const month = otherUtils.convertToNumber(created[1]) - 1;
        const day = otherUtils.convertToNumber(created[2]);
        const hour = otherUtils.convertToNumber(time[0]);
        const minute = otherUtils.convertToNumber(time[1]);
        const second = otherUtils.convertToNumber(time[2]);
        const date = new Date(eval(created[0]), month, day, hour, minute, second);

        const userName = data.user.name.split(' ');
        let initChars = userName[0][0];
        if (userName.length > 1) {
            initChars += userName[userName.length - 1][0];
        }

        const { showMoreLink, displayText } = getShortText(text, {showAllText, maxWords: 30})

        const { currentUser, data: comment, interpretationAccess } = this.props;
        const canUpdateByAcl = interpretationAccess && interpretationAccess.update;
        const canUpdateByUser = comment.user && currentUser.id === comment.user.id || currentUser.superUser;

        const commentActions = [
            { text: "Reply", condition: true, props: { onClick: this._reply } },
            { text: "Edit", condition: canUpdateByUser && canUpdateByAcl, props: { onClick: this._showEditHandler } },
            { text: "Delete", condition: canUpdateByUser && canUpdateByAcl, props: { onClick: this._deleteHandler } },
        ];

        return (
            <table>
                <tbody>
                    <tr>
                        <td className="valignTop">
                            <Avatar color="black" size={32} style={this.styles.avatar}>{initChars}</Avatar>
                        </td>

                        <td>
                            <div className="interpretationComment">
                                <div className="interpretationText">
                                    {!editMode ?
                                        <div>
                                            <RichTextParser style={this.styles.textParser}>
                                                {displayText}
                                            </RichTextParser>

                                            {showMoreLink &&
                                                <span className="moreLink" onClick={this._handleClick}> ... more</span>
                                            }
                                        </div>
                                        :
                                        <div>
                                            <MentionsWrapper d2={d2} onUserSelect={this._onTextChange}>
                                                <textarea className="commentArea" value={editText} onChange={this._onChange} />
                                            </MentionsWrapper>

                                            <a onClick={this._editCommentText}>OK</a><label className="linkArea">
                                            ·
                                            </label><a onClick={this._cancelCommentText}>Cancel</a>
                                        </div>
                                    }
                                </div>

                                <span className="tipText">
                                    <IntlProvider locale="en">
                                        <FormattedRelative value={date} />
                                    </IntlProvider>
                                </span>

                                <label className="linkArea"></label>
                                
                                <Actions actions={commentActions} />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    },
});

export default Comment;
