
import React, { Component } from 'react';
import { DatePicker, TextField, SelectField, MenuItem, Checkbox, IconButton } from 'material-ui';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';

import AutoCompleteUsers from './AutoCompleteUsers.component';
import { otherUtils, dateUtil } from './utils';

export default class AdvanceSearchForm extends Component {
    constructor(props) {
        super(props);

        // const today = new Date().toISOString();
        this.state = (!props.savedTerms) ? this.getInitialData() : props.savedTerms;

        this._clickCloseBtn = this._clickCloseBtn.bind(this);
        this._typeChanged = this._typeChanged.bind(this);
        this._onChangeText = this._onChangeText.bind(this);
        this._onChangeFavoritesName = this._onChangeFavoritesName.bind(this);
        this._onCheckFavorite = this._onCheckFavorite.bind(this);
        this._onCheckSubscribed = this._onCheckSubscribed.bind(this);
        this._onCheckMention = this._onCheckMention.bind(this);
    }

    getInitialData() {
        return {
            type: '',
            dateCreatedFrom: null,
            dateCreatedTo: null,
            dateModiFrom: null,
            dateModiTo: null,
            user: { id: '', displayName: '' },
            userDataSource: [],
            text: '',
            favoritesName: '',
            showFavoritesNameSearch: false,
            //favoritesNameSearchHint: '',
            favorite: false,
            subscribed: false,
            mention: false,
        };
    }

    getSearchConditions() {
        return this.state;
    }

    resetForm() {
        this.setState(this.getInitialData());

        if (this.refs.user !== undefined) this.refs.user.clear();
    }

    generateAdvSearchText() {
        let summaryStr = '';

        // TODO: Trim - otherUtils.trim
        if (this.state.type) summaryStr += `Type: ${this.state.type}, `;
        if (this.state.dateCreatedFrom) summaryStr += `dateCreatedFrom: ${dateUtil.formatDateMMDDYYYY(this.state.dateCreatedFrom, '/')}, `;
        if (this.state.dateCreatedTo) summaryStr += `dateCreatedTo: ${dateUtil.formatDateMMDDYYYY(this.state.dateCreatedTo, '/')}, `;
        if (this.state.dateModiFrom) summaryStr += `dateModiFrom: ${dateUtil.formatDateMMDDYYYY(this.state.dateModiFrom, '/')}, `;
        if (this.state.dateModiTo) summaryStr += `dateModiTo: ${dateUtil.formatDateMMDDYYYY(this.state.dateModiTo, '/')}, `;
        if (this.state.user.id) summaryStr += `user: ${this.state.user.displayName}, `;
        if (this.state.text) summaryStr += `text: ${this.state.text}, `;
        if (this.state.favoritesName) summaryStr += `favoritesName: ${this.state.favoritesName}, `;
        if (this.state.favorite) summaryStr += `favorite: ${this.state.favorite}, `;
        if (this.state.subscribed) summaryStr += `subscribed: ${this.state.subscribed}, `;
        if (this.state.mention) summaryStr += `mention: ${this.state.mention}, `;

        if (summaryStr) summaryStr = `${otherUtils.advSearchStr}: ${summaryStr.substring(0, summaryStr.length - 2)}`;

        return summaryStr;
    }

    _clickCloseBtn() {
        this.props.askPopupClose();
    }

    _typeChanged(event, index, value) {
        this.setState({ type: value });

        //this.setState({ favoritesNameSearchHint: 'Partial Type Favorites Name' });
        // Show Hide the line..
        const showFavoritesNameSearchRow = (value); // ? true : false;
        this.setState({ showFavoritesNameSearch: showFavoritesNameSearchRow });
    }

    _onChangeText(event) {
        this.setState({ text: event.target.value });
    }
    _onChangeFavoritesName(event) {
        this.setState({ favoritesName: event.target.value });
    }
    _onCheckFavorite(event) {
        setTimeout(() => {
            this.setState((oldState) => { return { favorite: !oldState.favorite }; });
        }, 1 );
    }
    _onCheckSubscribed(event) {
        setTimeout(() => {
            this.setState((oldState) => { return { subscribed: !oldState.subscribed }; });
        }, 1 );
    }
    _onCheckMention(event) {
        setTimeout(() => {
            this.setState((oldState) => { return { mention: !oldState.mention }; });
        }, 1 );
    }

    _tempClickFix( returnFunc ) {
        setTimeout( returnFunc, 1 );
    }

    renderDateFilterPicker = props => {
        const { field, hintText } = props;
        const value = this.state[field];
        const onChange = (ev, value) => this.setState({ [field]: value });
        const onClearClick = (ev, value) => this.setState({ [field]: undefined });
        const isClearButtonVisible = !!this.state[field];

        return (
            <div style={{ display: "flex" }}>
                <DatePicker
                    value={value}
                    style={{ width: '130px' }}
                    underlineStyle={{ width: '130px' }}
                    hintText={hintText}
                    hintStyle={{ fontSize: '14px' }}
                    onChange={onChange}
                />

                {isClearButtonVisible &&
                    <IconButton
                        style={{ position: "relative", right: 30, padding: 0, width: 0 }}
                        onClick={onClearClick}
                    >
                        <SvgIcon icon="Clear" />
                    </IconButton>
                }
            </div>
        );
    }

    render() {
        const hintStyle = { fontSize: '14px' };
        const underlineStyle = { width: '400px' };
        const menuStyle = { fontSize: '14px' };
        const fontStyle = { fontSize: '14px' };
        const DateFilterPicker = this.renderDateFilterPicker;

        return (
            <div className="advanceSearchForm">
                <div tabIndex="0" aria-label="Close search options" className="btnImages seachPopupCloseImg" role="button" onClick={this._clickCloseBtn}>
                    <svg x="0px" y="0px" width="12px" height="12px" viewBox="0 0 10 10" focusable="false" style={{ float: 'right', margin: '0 0 10px 10px' }}>
                        <polygon points="10,1.01 8.99,0 5,3.99 1.01,0 0,1.01 3.99,5 0,8.99 1.01,10 5,6.01 8.99,10 10,8.99 6.01,5 "></polygon>
                    </svg>
                </div>
                <table className="advanceSearchFormTable">
                    <tbody>
                        <tr>
                            <td className="tdTitle"><span className="searchStyle">Type</span></td>
                            <td className="tdData">
                                <SelectField value={this.state.type} style={fontStyle} menuStyle={menuStyle} hintStyle={hintStyle} onChange={this._typeChanged}>
                                    <MenuItem value="" primaryText="All" />
                                    <MenuItem value="CHART" primaryText="Chart" />
                                    <MenuItem value="REPORT_TABLE" primaryText="Report Table" />
                                    <MenuItem value="EVENT_CHART" primaryText="Event Chart" />
                                    <MenuItem value="EVENT_REPORT" primaryText="Event Report Table" />
                                    <MenuItem value="MAP" primaryText="Map" />
                                </SelectField>
                            </td>
                        </tr>
                        { this.state.showFavoritesNameSearch ? <tr>
                            <td className="tdTitle"><span className="searchStyle">Favorites Name</span></td>
                            <td className="tdData">
                                <TextField
                                    hintText="Partial Favorites Name"
                                    hintStyle={hintStyle}
                                    value={this.state.favoritesName}
                                    fullWidth
                                    underlineStyle={underlineStyle}
                                    onChange={this._onChangeFavoritesName}
                                />
                            </td>
                        </tr> : null }
                        <tr>
                            <td className="tdTitle"><span className="searchStyle">Date created</span></td>
                            <td className="tdData">
                                <table>
                                <tbody>
                                <tr>
                                <td>
                                    <DateFilterPicker field="dateCreatedFrom" hintText="From" />
                                </td>
                                <td>
                                    <div>-</div>
                                </td>
                                <td>
                                    <DateFilterPicker field="dateCreatedTo" hintText="To" />
                                </td>
                                </tr>
                                </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="tdTitle"><span className="searchStyle">Date modified</span></td>
                            <td className="tdData">
                                <table>
                                <tbody>
                                <tr>
                                    <td>
                                        <DateFilterPicker field="dateModiFrom" hintText="From" />
                                    </td>
                                    <td>
                                        <div>-</div>
                                    </td>
                                    <td>
                                        <DateFilterPicker field="dateModiTo" hintText="To" />
                                    </td>
                                </tr>
                                </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="tdTitle"><span className="searchStyle">Follow-ups</span></td>
                            <td className="tdData">
                                <table>
                                <tbody>
                                <tr>
                                    <td>
                                        <Checkbox
                                            label="Mention"
                                            value={this.state.mention}
                                            checked={this.state.mention}
                                            onCheck={this._onCheckMention}
                                            iconStyle={{left: 7}}
                                        />
                                    </td>
                                    <td>
                                        <Checkbox
                                            label="Subscribed"
                                            value={this.state.subscribed}
                                            checked={this.state.subscribed}
                                            onCheck={this._onCheckSubscribed}
                                            iconStyle={{left: 7}}
                                        />
                                    </td>
                                </tr>
                                </tbody>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td className="tdTitle"><span className="searchStyle">User (interpretation/comment)</span></td>
                            <td className="tdData">
                                <AutoCompleteUsers searchId="user" fullWidth hintStyle={hintStyle} item={this.state.user} ref="user" />
                            </td>
                        </tr>

                        <tr>
                            <td className="tdTitle"><span className="searchStyle">Text (interpretation/comment)</span></td>
                            <td className="tdData">
                                <TextField
                                    hintText="Partial Interpretation Text"
                                    hintStyle={hintStyle}
                                    value={this.state.text}
                                    fullWidth
                                    onChange={this._onChangeText}
                                />
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        );
    }
}

AdvanceSearchForm.propTypes = {
    savedTerms: React.PropTypes.object,
    askPopupClose: React.PropTypes.func,
};
