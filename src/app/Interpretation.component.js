
import React from 'react';
import { Dialog, FlatButton } from 'material-ui';
import SharingDialog from './sharing/SharingDialog.component';
import MessageOwner from './MessageOwner.component';
import CommentArea from './CommentArea.component';
import AccessInfo from './AccessInfo.component';
import { getInstance as getD2 } from 'd2/lib/d2';
import { delayOnceTimeAction, restUtil, dhisUtils, otherUtils } from './utils';
import { dataInfo } from './data';
import { validateSharing } from '../utils/permissions';

import actions from './actions/Interpretation.action';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import Actions from './Actions.component';

const Interpretation = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        currentUser: React.PropTypes.object,
        d2Api: React.PropTypes.object,
        deleteInterpretationSuccess: React.PropTypes.func,
    },

    getInitialState() {
        return {
            text: this.props.data.text,
            likes: this.props.data.likes,
            likedBy: this.props.data.likedBy,
            open: false,
            openAccessInfo: false,
            newCommentVisibilityKey: null,
            newCommentText: "",
            comments: this.props.data.comments,
            isTooltipActive: false,
            isSharingDialogOpen: false,
            editMode: false,
        };
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    componentDidMount() {
        this._drawIntepretation();
    },

    _drawIntepretation( isRedraw ) {

        delayOnceTimeAction.bind(1000, `resultInterpretation${this.props.data.id}`, () => {
            const divId = this.props.data.id;

            if (this.props.data.type === 'REPORT_TABLE') {
                this._setReportTable();
            } else if (this.props.data.type === 'MAP') {
                if (isRedraw) {
                    $(`#${divId}`).html('<img className="loadingImg" src="images/ajax-loader-circle.gif" />');
                }
                actions.getMap('', this.props.data.map.id).subscribe(result => {
                    this._setMap(result);
                });
            } else if (this.props.data.type === 'EVENT_REPORT') {
                if (!isRedraw) {
                    this._setEventReport();
                }
            } else if (this.props.data.type === 'EVENT_CHART') {
                if (!isRedraw) {
                    this._setEventChart();
                }
            }
        });

        delayOnceTimeAction.bind(8000, `imgLoading${this.props.data.id}`, () => {
            const divId = this.props.data.id;
            $(`#${divId}`).find('img.loadingImg').remove();
        });
    },

    /* _hasRelativePeriods(relativePeriods) {
        if (this.props.data.type === 'MAP') {
            for (const key in relativePeriods) {
                if (relativePeriods[key] && this.relativePeriodKeys.indexOf(key) < 0) {
                    return true;
                }
            }
        } else if (this.props.data.type === 'EVENT_REPORT') {
            for (const key in relativePeriods) {
                if (relativePeriods[key]) {
                    return true;
                }
            }
        } else if (this.props.data.type === 'EVENT_CHART') {
            for (const key in relativePeriods) {
                if (relativePeriods[key]) {
                    return true;
                }
            }
        }

        return false;
    }, */

    _setReportTable() {
        //const width = dataInfo.getInterpDivWidth();
        const divId = this.props.data.id;

        $(`#${divId}`).closest('.interpretationItem ').addClass('contentTable');
        $(`#${divId}`).css('maxHeight', `${dataInfo.interpObjMaxHeight}px`);
    },

    _setEventReport() {
        getD2().then(d2 => {
            eventReportPlugin.url = restUtil.getUrlBase_Formatted(d2);
            eventReportPlugin.load([{
                id: this.props.data.objId,
                el: this.props.data.id,
                relativePeriodDate: this.props.data.created,
            }]);
        });
    },

    _setEventChart() {
        getD2().then(d2 => {
            eventChartPlugin.url = restUtil.getUrlBase_Formatted(d2);
            eventChartPlugin.load([{
                id: this.props.data.objId,
                el: this.props.data.id,
                relativePeriodDate: this.props.data.created,
            }]);
        });
    },

    detectRendered(divId, returnFunc) {
        const maxTimesRun = 15;
        const intervalTime = 500;
        let timesRun = 0;

        const interval = setInterval(() => {
            timesRun++;
            const panelTag = $(`#${divId}`).find('div.x-panel');

            if (timesRun >= maxTimesRun) {
                clearInterval(interval);
                returnFunc(false, panelTag);
            } else if (panelTag.length > 0) {
                clearInterval(interval);
                returnFunc(true, panelTag);
            }
        }, intervalTime);
    },

    relativePeriodKeys: [
        'THIS_MONTH',
        'LAST_MONTH',
        'monthsThisYear',
        'LAST_3_MONTHS',
        'LAST_6_MONTHS',
        'LAST_12_MONTHS',
        'THIS_YEAR',
        'LAST_YEAR',
        'LAST_5_YEARS',
    ],

    _setMap(data) {
        const me = this;
        getD2().then(d2 => {			
            const divId = this.props.data.id;
            $(`#${divId}`).css('height', `${dataInfo.mapHeight}px`);
            mapPlugin.url = restUtil.getUrlBase_Formatted( d2 );
            mapPlugin.load({
                id: data.id,
                el: divId,
                relativePeriodDate: this.props.data.created,                
            });
        });
    },

    // Quaterly && 6-month period
    _converRelativePeriods(relativePeriodKey, createdDate) {
        let periods = [];

        const created = createdDate.substring(0, 10).split('-');
        let month = Number(created[1]);
        month = month - 1;
        const day = Number(created[2]);
        const date = new Date(created[0], month, day);

        const currentYear = date.getFullYear();

        // Yearly periods
        if (relativePeriodKey === 'THIS_YEAR') {
            periods.push({ id: currentYear.toString(), name: currentYear.toString() });
        } else if (relativePeriodKey === 'LAST_YEAR') {
            const lastYear = currentYear - 1;
            periods.push({ id: lastYear.toString(), name: lastYear.toString() });
        } else if (relativePeriodKey === 'LAST_5_YEARS') {
            const start = currentYear - 5;
            const end = currentYear - 1;
            for (let year = start; year >= end; year++) {
                periods.push({ id: year.toString(), name: year.toString() });
            }
        } else if (relativePeriodKey === 'THIS_MONTH') { // Monthy periods
            let currentMonth = date.getMonth() + 1;// Month from Date Object starts from 0
            currentMonth = (currentMonth > 10) ? currentMonth : `0${currentMonth}`;
            const period = `${currentYear}${currentMonth}`;
            periods.push({ id: period, name: period });
        } else if (relativePeriodKey === 'LAST_MONTH') {
            let currentMonth = date.getMonth();// Month from Date Object starts from 0
            currentMonth = (currentMonth > 10) ? currentMonth : `0${currentMonth}`;
            periods.push({ id: `${currentYear}${currentMonth}`, name: `${currentYear}${currentMonth}` });
        } else if (relativePeriodKey === 'monthsThisYear') {
            const currentMonth = date.getMonth();// Month from Date Object starts from 0
            for (let m = 1; m <= currentMonth; m++) {
                const k = (m > 10) ? m : `0${m}`;
                periods.push({ id: `${currentYear}${k}` });
            }
        } else if (relativePeriodKey === 'LAST_12_MONTHS') {
            periods = periods.concat(this._getLastNMonth(12, currentYear, date.getMonth()));
        } else if (relativePeriodKey === 'LAST_3_MONTHS') {
            periods = periods.concat(this._getLastNMonth(3, currentYear, date.getMonth()));
        } else if (relativePeriodKey === 'LAST_6_MONTHS') {
            periods = periods.concat(this._getLastNMonth(6, currentYear, date.getMonth()));
        }

        return periods;
    },

    _quarterlyNames: ['Jan - Mar', 'Apr - Jun', 'Jul - Sep', 'Oct - Dec'],

    _getLastNMonth(noNumber, year, month) {
        const currentYearPeriods = [];

        let count = 0;
        for (let m = month; m >= 1 && count < noNumber; m--) {
            const k = (m >= 10) ? m : `0${m}`;
            currentYearPeriods.push({ id: `${year}${k}`, name: `${year}${k}` });
            count++;
        }

        const lastYearPeriods = [];
        if (count < noNumber - 1) {
            const lastYear = year - 1;
            for (let m = noNumber; m >= 1 && count < noNumber; m--) {
                const k = (m >= 10) ? m : `0${m}`;
                lastYearPeriods.push({ id: `${lastYear}${k}`, name: `${lastYear}${k}` });
                count++;
            }
        }

        let periods = lastYearPeriods.reverse();
        periods = periods.concat(currentYearPeriods.reverse());

        return periods;
    },

    _likeHandler() {
        actions.updateLike(this.props.data, this.props.data.id).subscribe(() => {
            const likes = this.state.likes + 1;
            const likedBy = this.state.likedBy;
            likedBy.push({ name: this.props.currentUser.name, id: this.props.currentUser.id });

            this.setState({
                likes,
                likedBy,
            }, function () {
                const peopleLikeTagId = `peopleLike_${this.props.data.id}`;
                const postComentTagId = `postComent_${this.props.data.id}`;
                $(`#${peopleLikeTagId}`).show();
                $(`#${postComentTagId}`).closest('.interpretationCommentArea').show();
            });
        });
    },

    _unlikeHandler() {
        actions.removeLike(this.props.data, this.props.data.id).subscribe(() => {
            const likes = this.state.likes - 1;
            const likedBy = this.state.likedBy;
            otherUtils.removeFromList(likedBy, 'id', this.props.currentUser.id);

            this.setState({
                likes,
                likedBy,
            }, function () {
                if (likes === 0) {
                    const peopleLikeTagId = `peopleLike_${this.props.data.id}`;
                    $(`#${peopleLikeTagId}`).hide();
                }
            });
        });
    },

    _deleteHandler() {
        actions.deleteInterpretation(this.props.data, this.props.data.id)
			.subscribe(() => {
            this.props.deleteInterpretationSuccess(this.props.data.id);
		});
    },

    _openSharingDialog() {
        this.setState({ isSharingDialogOpen: true });
    },

    _closeSharingDialog() {
        this.setState({ isSharingDialogOpen: false });
    },

    _starHandler( e ) {
        //const starImgTag = this._getTopRightIconImgByType( 'star' );
        this._switchMark( 'star', 'favorite', 'marked.png', 'unmarked.png', 'Starred', 'Not Starred' );
    },

    _subscribeHandler() {
        //const starImgTag = this._getTopRightIconImgByType( 'subscribe' );
        this._switchMark( 'subscribe', 'subscriber', 'start_yes.png', 'start_no.png', 'Subscribed', 'Not Subscribed' );
    },

    // -------------------------------------------
    _getTopRightIconImgByType( typeStr ) {
        const interpretationTagId = `interpretation_${this.props.data.id}`;
        //console.log( 'interpretationTagId: ' + interpretationTagId );
        const interpDivTag = $( '#' + interpretationTagId );

        return interpDivTag.find( 'img.' + typeStr );
    },

    _switchMark( typeStr, typeName, markImgSrcStr, unmarkImgSrcStr, markTitleStr, unmarkTitleStr ) {
        const dataType = dhisUtils.getMatchingApiObjTypeName(this.props.data.type);
        const queryUrl = _dhisLoc + 'api/' + dataType + '/' + this.props.data.objId + '/' + typeName;

        const imgTag = this._getTopRightIconImgByType( typeStr );
        // Do universal same sourceId icon change        
        const imgTags_All = otherUtils.getSameSourceInterpIconTags( imgTag, typeStr, 'srcObj_' );
                
        if ( imgTag.hasClass( 'unmarked' ) )
        {
            restUtil.requestPostHelper(this.props.d2Api, queryUrl, '', () => {
                imgTags_All.removeClass( 'unmarked' );
                imgTags_All.addClass( 'marked' );
                imgTags_All.attr( 'src', 'images/' + markImgSrcStr );
                imgTags_All.attr( 'title', markTitleStr );
            }, 'application/json' );
        }
        else if ( imgTag.hasClass( 'marked' ) )
        {
            restUtil.requestHelper(this.props.d2Api, queryUrl, '', () => {
                imgTags_All.removeClass( 'marked' );
                imgTags_All.addClass( 'unmarked' );
                imgTags_All.attr( 'src', 'images/' + unmarkImgSrcStr );
                imgTags_All.attr( 'title', unmarkTitleStr );                
            }, 'DELETE', 'application/json' );
        }        
    },

    _replyInterpretation() {
        this._replyToUser(this.props.data.username);
    },

    _replyComment(comment) {
        this._replyToUser(comment.user.userCredentials.username);
    },

    _replyToUser(replyToUsername) {
        const insertReplyMention = replyToUsername && this.props.currentUser.username !== replyToUsername;
        const newCommentText = insertReplyMention ? `@${replyToUsername} ` : "";
        this.setState({ newCommentVisibilityKey: new Date(), newCommentText });
    },

    _showEditHandler() {
        this.setState({ editMode: true });
    },

    _editInterpretationTextSuccess(text) {
        this.props.data.text = text;
        this.setState({ text, editMode: false});
    },

    _editInterpretationTextCancel() {
        this.setState({ editMode: false });
    },

    _openPeopleLikedHandler() {
        this.setState({
            open: true,
        });
    },

    _closePeopleLikedHandler() {
        this.setState({
            open: false,
        });
    },

    _getPeopleLikeList() {
        const list = this.state.likedBy.slice(0, 10);
        return <div>{list.map(likedByUserName => <span key={likedByUserName.id}>{likedByUserName.name}<br /></span>)} {this.state.likedBy.length > 10 ? <span>more...</span> : '' }</div>;
    },

    _openAccessInfoHandler() {
        this.setState({
            openAccessInfo: true,
        });
    },

    _closeAccessInfoHandler() {
        this.setState({
            openAccessInfo: false,
        });
    },

    _getSourceInterpretationLink() {
        let link = '';
        let fullLink = '';
        if (this.props.data.type === 'REPORT_TABLE') {
            link = 'dhis-web-pivot';
        } else if (this.props.data.type === 'CHART') {
            fullLink = `${_dhisLoc}dhis-web-data-visualizer/index.html#/${this.props.data.objId}/interpretation/${this.props.data.id}`;
        } else if (this.props.data.type === 'MAP') {
            fullLink = `${_dhisLoc}dhis-web-maps/index.html?id=${this.props.data.objId}&interpretationid=${this.props.data.id}`;
        } else if (this.props.data.type === 'EVENT_REPORT') {
            link = 'dhis-web-event-reports';
        } else if (this.props.data.type === 'EVENT_CHART') {
            link = 'dhis-web-event-visualizer'; // Event chart
        }

        // ?? ${_dhisLoc}??
        return (fullLink !== '') ? fullLink
                                 : (link === '') ? '' : `${_dhisLoc}${link}/index.html?id=${this.props.data.objId}&interpretationId=${this.props.data.id}`;
    },

    _exploreInterpretation() {
        window.location.href = this._getSourceInterpretationLink();
    },

    _validateSharing(updatedAttributes, prevAttributes) {
        const { d2 } = this.context;
        const { data } = this.props;
        const getTranslation = d2.i18n.getTranslation.bind(d2.i18n);
        return validateSharing(getTranslation, data.objData, updatedAttributes, prevAttributes);
    },

    render() {
        const likeLinkTagId = `likeLink_${this.props.data.id}`;
        const interpretationTagId = `interpretation_${this.props.data.id}`;
        const peopleLikeTagId = `peopleLike_${this.props.data.id}`;
        const peopleLikeLinkTagId = `peopleLikeLink_${this.props.data.id}`;
        const commentAreaKey = `commentArea_${this.props.data.id}`;
        const messageOwnerKey = `messageOwnerKey_${this.props.data.id}`;
        const likeDialogKey = `likeDialogKey_${this.props.data.id}`;
        const relativePeriodMsgId = `relativePeriodMsg_${this.props.data.id}`;
        const sourceLink = this._getSourceInterpretationLink();
        const { isSharingDialogOpen } = this.state;

        const { newCommentText, newCommentVisibilityKey } = this.state;

        const peopleLikedByDialogActions = [
            <FlatButton type="button"
                onClick={this._closePeopleLikedHandler}
                label="Cancel"
                primary
            />,
        ];

        const { currentUser, data: interpretation } = this.props;
        const isLiked = otherUtils.findItemFromList(this.props.data.likedBy, 'id', this.props.currentUser.id);
        const canUpdateByAcl = interpretation.access && interpretation.access.update;
        const canUpdateByUser = currentUser.id === interpretation.userId || currentUser.superUser;

        const interpretationActions = [
            isLiked
                ? { text: "Unlike", props: { onClick: this._unlikeHandler, id: likeLinkTagId} }
                : { text: "Like", props: { onClick: this._likeHandler, id: likeLinkTagId} },
            { text: "Reply", condition: true, props: { onClick: this._replyInterpretation } },
            { text: "Edit", condition: canUpdateByAcl && canUpdateByUser, props: { onClick: this._showEditHandler } },
            { text: "Share", condition: canUpdateByAcl, props: { onClick: this._openSharingDialog } },
            { text: "Delete", condition: canUpdateByAcl && canUpdateByUser, props: { onClick: this._deleteHandler } },
        ]

        return (
			<div id={interpretationTagId} key={interpretationTagId} className="interpretations">
				<div className="interpretationContainer" >

                    <div>
                        <div className="interpretationItem">
                            <div className="title">
                                <span>{this.props.data.name}</span>
                                <label className="linkArea">
                                    <span className="smallFont">|</span>
                                    <a href={sourceLink} className="userLink leftSpace smallFont" target="_blank">Explore</a>
                                </label>
                                <div className="interpTopRightDiv">
                                    { this.props.data.objData !== undefined 
                                    ?   <div>
                                            <a onClick={this._subscribeHandler} className="topRightAnchors">
                                                { otherUtils.findInArray( this.props.data.objData.subscribers, this.props.currentUser.id ) >= 0 
                                                    ? <img src="images/start_yes.png" title="Subscribed" className={`topRightIcons subscribe marked srcObj_${this.props.data.objId}`} />
                                                    : <img src="images/start_no.png" title="Not Subscribed" className={`topRightIcons subscribe unmarked srcObj_${this.props.data.objId}`} /> 
                                                }
                                            </a>
                                        </div>
                                    : <div></div>
                                    }
                                </div>
                            </div>
                            <div id={this.props.data.id} ><img className="loadingImg" src="images/ajax-loader-circle.gif" /></div>
                        </div>
                    </div>

                    <div id={relativePeriodMsgId} className="relativePeriodWarming"></div>

                    <MessageOwner
                        key={messageOwnerKey}
                        data={this.props.data}
                        sourceLink={sourceLink}
                        text={this.state.text}
                        editMode={this.state.editMode}
                        editInterpretationTextSuccess={this._editInterpretationTextSuccess}
                        editInterpretationTextCancel={this._editInterpretationTextCancel}
                    />

                    <div className="linkTag">
                        <Actions actions={interpretationActions} />
                    </div>

                    <SharingDialog
                        open={isSharingDialogOpen}
                        id={this.props.data.id}
                        type="interpretation"
                        onRequestClose={this._closeSharingDialog}
                        validate={this._validateSharing}
                    />

                     <div className="interpretationCommentArea">
                        <div id={peopleLikeTagId} className={this.state.likes > 0 ? 'greyBackground likeArea paddingLeft' : 'hidden greyBackground likeArea'}>
                            <img src="images/like.png" className="verticalAlignTop" />
                            <Tooltip
                                placement="left"
                                overlay={this._getPeopleLikeList()}
                                arrowContent={<div className="rc-tooltip-arrow-inner"></div>}
                            >
                                    <a onClick={this._openPeopleLikedHandler} id={peopleLikeLinkTagId}>{this.state.likes} people </a>
                            </Tooltip>
                            <span> liked this</span><label className="linkArea">·</label><span>{this.state.comments.length} people commented</span>
                            <br />
                        </div>

                        <CommentArea
                            key={commentAreaKey}
                            comments={this.state.comments}
                            likes={this.state.likes}
                            interpretationId={this.props.data.id}
                            interpretationAccess={this.props.data.access}
                            likedBy={this.state.likedBy}
                            currentUser={this.props.currentUser}
                            newCommentVisibilityKey={newCommentVisibilityKey}
                            newCommentText={newCommentText}
                            onReply={this._replyComment}
                        />

                        <Dialog
                            title="People"
                            actions={peopleLikedByDialogActions}
                            modal
                            open={this.state.open}
                            onRequestClose={this._closePeopleLikedHandler}
                        >
                            <div key={likeDialogKey}>
                                {this.state.likedBy.map(likedByUserName =>
                                    <p key={likedByUserName.id}>{likedByUserName.name}</p>
                                )}
                            </div>
                        </Dialog>


                    </div>
                </div>
			</div>
		);
    },
});

export default Interpretation;
