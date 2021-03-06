
import React from 'react';
import { MenuItem, AutoComplete } from 'material-ui';
import { delayOnceTimeAction } from './utils';
import { getInstance as getD2 } from 'd2/lib/d2';


const AutoCompleteUsers = React.createClass({
    propTypes: {
        searchId: React.PropTypes.string,
        item: React.PropTypes.object,
        hintStyle: React.PropTypes.object,
    },

    getInitialState() {
        return {
            value: (this.props.item) ? this.props.item.displayName : '',
            loading: false,
            open: false,
            userDataSource: [],
            user: (this.props.item) ? this.props.item : { id: '', displayName: '' },
        };
    },

    clear() {
        this.setState({ value: '', user: { id: '', displayName: '' } });
    },

    _onUpdateUsers(value) {
        this.setState({ value });

        delayOnceTimeAction.bind(500, this.props.searchId, () => {
            if (value === '') {
                this.setState({ userDataSource: [], user: { id: '', displayName: '' } });

                this.props.item.id = '';
                this.props.item.displayName = '';
            } else {
                getD2().then(d2 => {
                    const url = `users.json?paging=true&fields=id,displayName,userCredentials[username]` +
                        `&filter=name:ilike:${value}&filter=userCredentials.username:ilike:${value}&rootJunction=OR`;

                    d2.Api.getApi().get(url).then(result => {
                        const userList = [];

                        for (const user of result.users) {
                            const source = { id: user.id, displayName: `${user.displayName} (${user.userCredentials.username})` };
                            userList.push({ text: source.displayName, value: <MenuItem primaryText={source.displayName} value={source.id} />, source });
                        }

                        this.setState({ userDataSource: userList });
                    })
                    .catch(errorResponse => {
                        console.log(`error ${errorResponse}`);
                    });
                });
            }
        });
    },

    _onSelectUser(value, i) {
        // Set real user here with setstate!!
        this.state.user = this.state.userDataSource[i].source;
        this.props.item.id = this.state.user.id;
        this.props.item.displayName = this.state.user.displayName;
    },

    render() {
        return (
            <AutoComplete
                hintText="Enter User Name"
                hintStyle={this.props.hintStyle}
                filter={AutoComplete.noFilter}
                onUpdateInput={this._onUpdateUsers}
                onNewRequest={this._onSelectUser}
                dataSource={this.state.userDataSource}
                searchText={this.state.value}
                fullWidth
            />
        );
    },
});

export default AutoCompleteUsers;
