import React from 'react';

export default function Actions({ actions }) {
    const links = actions
        .filter(action => action.condition !== false)
        .map((action, index) =>
            <span key={index}>
                {index > 0 && <label className="linkArea">·</label>}
                <a {...action.props}>{action.text}</a>
            </span>
        );
    
    return (<span>{links}</span>);
}

Actions.propTypes = {
    actions: React.PropTypes.arrayOf(React.PropTypes.shape({
        condition: React.PropTypes.bool,
        props: React.PropTypes.object.isRequired,
        text: React.PropTypes.string.isRequired,
    })).isRequired,
};
