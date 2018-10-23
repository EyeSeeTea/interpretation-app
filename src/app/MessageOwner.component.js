import React from 'react';
import { IntlProvider, FormattedDate } from 'react-intl';
import { Parser as RichTextParser } from '@dhis2/d2-ui-rich-text';

import MentionsWrapper from './mentions-wrapper';
import { otherUtils } from './utils';
import actions from './actions/Interpretation.action';
import { getShortText } from '../utils/content';

const MessageOwner = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        text: React.PropTypes.string,
        editMode: React.PropTypes.bool,
        editInterpretationTextSuccess: React.PropTypes.func,
        editInterpretationTextCancel: React.PropTypes.func,
        sourceLink: React.PropTypes.string,
    },

    styles: {
        textParser: { display: "inline", whiteSpace: "pre-line", overflowWrap: "break-word" },
    },

    getInitialState() {
        return {
            showAllText: false,
            editText: "",
        }
    },

    componentWillReceiveProps(nextProps) {
        const editModeStarted = !this.props.editMode && nextProps.editMode;

        if (editModeStarted) {
            this.setState({ editText: this.props.text });
        }
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    _onChange(e) {
        this.setState({ editText : e.target.value });
    },

    _onTextChange(text) {
        this._onChange({ target: { value: text } });
    },

    handleClick(e) {
        this.setState({ showAllText: true });
    },

    _editInterpretationText() {
        const editText = this.state.editText;

        actions.editInterpretation(this.props.data, this.props.data.id, editText)
			.subscribe(() => {
                this.props.editInterpretationTextSuccess(editText);
            });
    },

    _cancelInterpretationText() {
        this.props.editInterpretationTextCancel();
    },

    _convertToNumber(n) {
        return (n.startsWith('0')) ? eval(n[1]) : eval(n);
    },

    render() {
        const { d2 } = this.context;
        const { text, editMode } = this.props;
        const { showAllText, editText } = this.state;

        const created = this.props.data.created.substring(0, 10).split('-');
        const month = this._convertToNumber(created[1]) - 1;
        const day = this._convertToNumber(created[2]);
        const date = new Date(created[0], month, day);
        const { showMoreLink, displayText } = getShortText(text, {showAllText, maxWords: 50})

        return (
			<div className="interpretationDescSection">
				<div className="interpretationName">
                    <a href={this.props.sourceLink} className="bold userLink" target="_blank">{this.props.data.user}</a>
					<span className="tipText leftSpace">
					<IntlProvider locale="en">
					<FormattedDate
                        value={date}
                        day="2-digit"
                        month="short"
                        year="numeric"
					/>
					</IntlProvider>
					</span>
				</div>

				<div className="interpretationText">
                    {!editMode ?
                        <div>
                            <RichTextParser style={this.styles.textParser}>
                                {displayText}
                            </RichTextParser>

                            {showMoreLink &&
                                <span className="moreLink" onClick={this.handleClick}> ... more</span>
                            }
                        </div>
                        :
                        <div>
                            <MentionsWrapper d2={d2} onUserSelect={this._onTextChange}>
                                <textarea className="commentArea" value={editText} onChange={this._onChange} />
                            </MentionsWrapper>
                            <br />
                            <a onClick={this._editInterpretationText}>  OK </a> |
                            <a onClick={this._cancelInterpretationText}>  Cancel</a>
                        </div>
                    }
				</div>
			</div>
		);
    },
});

export default MessageOwner;
