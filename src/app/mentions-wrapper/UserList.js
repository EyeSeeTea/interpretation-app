import React from 'react';
import PropTypes from 'prop-types';
import List, { ListItem } from 'material-ui/List';
import Popover from 'material-ui/Popover';

const styles = {
    popover: {
        // ensure the popover show on top of other dialogs/modals
        zIndex: 2000,
    },
    list: {
        maxHeight: 180,
    },
    selected: {
        backgroundColor: 'lightgrey', // TODO not the same color as the MUI one, also clashes when the mouse is moved on the list, as the selection done programmatically remains active
    },
    filter: {
        display: 'block',
        padding: '8px 24px',
        color: 'gray',
        fontSize: '0.8125rem',
    },
};

export const UserList = ({
    d2,
    open,
    anchorEl,
    users,
    filter,
    selectedUser,
    onClose,
    onSelect,
}) => {
    const onClick = user => event => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        onSelect(user);
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            anchorPosition={{ top: 15, left: 0 }}
            disableAutoFocus
            onClose={onClose}
            style={styles.popover}
        >
            {users.length ? (
                <div>
                    <span>
                        <em style={styles.filter}>
                            {d2.i18n.getTranslation('searching_for', { filter })}
                        </em>
                    </span>
                    <List style={styles.list}>
                        {users.map(u => (
                            <ListItem
                                key={u.id}
                                onClick={onClick(u)}
                                style={
                                    selectedUser && selectedUser.id === u.id
                                        ? styles.selected
                                        : null
                                }
                                primaryText={`${u.displayName} (${u.userCredentials.username})`}
                            />
                        ))}
                    </List>
                </div>
            ) : (
                <em style={styles.filter}>
                    {d2.i18n.getTranslation('no_results_for', { filter })}
                </em>
            )}
        </Popover>
    );
};

UserList.defaultProps = {
    open: false,
    anchorEl: null,
    users: [],
    selectedUser: null,
    filter: null,
};

UserList.propTypes = {
    open: PropTypes.bool,
    anchorEl: PropTypes.object,
    users: PropTypes.array,
    selectedUser: PropTypes.object,
    filter: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    d2: PropTypes.object.isRequired,
};

export default UserList;
