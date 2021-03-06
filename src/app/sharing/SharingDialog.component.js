import { config, getInstance } from 'd2/lib/d2';
import Dialog from 'material-ui/Dialog/Dialog';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';
import React from 'react';
import Sharing from './Sharing.component';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

config.i18n.strings.add('share');
config.i18n.strings.add('close');
config.i18n.strings.add('no_manage_access');

const styles = {
    loadingMask: {
        position: 'relative',
    },
    snackBar: {
        height: 'auto',
        lineHeight: '28px',
        padding: 24,
        whiteSpace: 'pre-line',
    },
};

const defaultState = {
    sharedObject: null,
    errorMessage: '',
};

/**
 * A pop-up dialog for changing sharing preferences for a sharable object.
 */
class SharingDialog extends React.Component {
    state = {
        ...defaultState,
        dataShareableTypes: [],
    };

    componentDidMount() {
        this.loadDataSharingSettings();
        if (this.props.open && this.props.type && this.props.id) {
            this.loadObjectFromApi();
        }
    }

    componentWillReceiveProps(nextProps) {
        const hasChanged = this.createPropsChecker(nextProps);

        if (hasChanged('id') || hasChanged('type')) {
            this.resetState();
            if (nextProps.open) this.loadObjectFromApi();
        }

        if (!this.props.open && nextProps.open) {
            this.loadObjectFromApi();
        }
    }

    onSearchRequest = key =>
        this.state.api.get('sharing/search', { key })
            .then(searchResult => searchResult);

    onSharingChanged = (updatedAttributes, onSuccess) => {
        const { validate } = this.props;
        const prevAttributes = this.state.sharedObject.object;
        const validateError = validate ? validate(updatedAttributes, prevAttributes) : null;

        if (validateError) {
            this.setState({ errorMessage: validateError });
            return;
        }

        const updatedObject = {
            meta: this.state.sharedObject.meta,
            object: {
                ...this.state.sharedObject.object,
                ...updatedAttributes,
            },
        };

        this.postChanges(updatedObject, onSuccess);
    }

    createPropsChecker = nextProps => field => nextProps[field] !== this.props[field];

    postChanges = (updatedObject, onSuccess) => {
        const url = `sharing?type=${this.props.type}&id=${this.props.id}`;
        return this.state.api.post(url, updatedObject)
            .then(({ httpStatus, message }) => {
                if (httpStatus === 'OK') {
                    this.setState({
                        sharedObject: updatedObject,
                    }, () => {
                        if (onSuccess) onSuccess();
                    });
                }

                return message;
            }).catch(({ message }) => {
                this.setState({
                    errorMessage: message,
                });
            });
    }

    resetState = () => {
        this.setState(defaultState);
    }

    loadDataSharingSettings = () => {
        getInstance().then((d2) => {
            const api = d2.Api.getApi();

            api.get('schemas', { fields: ['name', 'dataShareable'] })
                .then((schemas) => {
                    const dataShareableTypes = schemas.schemas
                        .filter(item => item.dataShareable)
                        .map(item => item.name);

                    this.setState({
                        dataShareableTypes,
                    });
                });
        });
    }

    loadObjectFromApi = () => {
        getInstance().then((d2) => {
            const api = d2.Api.getApi();
            const { type, id } = this.props;

            api.get('sharing', { type, id })
                .then((sharedObject) => {
                    this.setState({
                        api,
                        sharedObject,
                    });
                })
                .catch((error) => {
                    this.setState({
                        errorMessage: error.message,
                    });
                });
        });
    }

    closeSharingDialog = () => {
        this.props.onRequestClose(this.state.sharedObject.object);
    }

    clearErrorMessage = () => {
        this.setState({ errorMessage: ''});
    }

    render() {
        const dataShareable = this.state.dataShareableTypes.indexOf(this.props.type) !== -1;
        const errorOccurred = this.state.errorMessage !== '';
        const isLoading = !this.state.sharedObject && this.props.open && !errorOccurred;
        const sharingDialogActions = [
            <FlatButton
                label={this.context.d2.i18n.getTranslation('close')}
                onClick={this.closeSharingDialog}
            />,
        ];

        return (
            <div>
                <Snackbar
                    open={errorOccurred}
                    message={this.state.errorMessage}
                    autoHideDuration={3000}
                    onRequestClose={this.clearErrorMessage}
                    bodyStyle={styles.snackBar}
                />
                { isLoading && <LoadingMask style={styles.loadingMask} size={1} /> }
                { this.state.sharedObject &&
                    <Dialog
                        autoDetectWindowHeight
                        autoScrollBodyContent
                        open={this.props.open}
                        title={this.context.d2.i18n.getTranslation('share')}
                        actions={sharingDialogActions}
                        onRequestClose={this.closeSharingDialog}
                        {...this.props}
                    >
                        <Sharing
                            sharedObject={this.state.sharedObject}
                            dataShareable={dataShareable}
                            onChange={this.onSharingChanged}
                            onSearch={this.onSearchRequest}
                        />
                    </Dialog>
                }
            </div>
        );
    }
}

SharingDialog.propTypes = {
    /**
     * Decides whether the dialog should be open or closed.
     */
    open: PropTypes.bool.isRequired,

    /**
     * Function to be called when the dialog is closed. The function is called
     * with the updated sharing preferences as the first and only argument.
     */
    onRequestClose: PropTypes.func.isRequired,

    /**
     * Type of the sharable object.
     */
    type: PropTypes.string.isRequired,

    /**
     * Id of the sharable object.
     */
    id: PropTypes.string.isRequired,

    /**
     * A function (optional) that takes the partial sharing object about to be saved.
     * If the save should go ahead, return null; if the save should be cancelled, return
     * a string describing the problem.
     */
    validate: PropTypes.func,
};

SharingDialog.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default SharingDialog;
