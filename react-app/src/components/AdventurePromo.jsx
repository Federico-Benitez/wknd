import React from 'react';

import './AdventurePromo.scss';

/**
* @param {*} content is the fully hydrated JSON data for a WKND Adventure Content Fragment
* @returns the Adventure Promo component
*/
export default function AdventurePromo({ content }) {
    if (!content) {
        // If content is still loading, then display an empty promote to prevent layout shift when Target loads the data
        return (<div className="adventure-promo"></div>)
    }

    const title = content.title;
    const description = content?.description?.plaintext;
    const image = content.primaryImage?._publishUrl;

    return (
        <div className="adventure-promo">
            <div className="adventure-promo-text-wrapper">
                <h3 className="adventure-promo-eyebrow">Promoted adventure</h3>
                <h2 className="adventure-promo-title">{title}</h2>
                <p className="adventure-promo-description">{description}</p>
            </div>
            <div className="adventure-promo-image-wrapper">
                <img className="adventure-promo-image" src={image} alt={title} />
            </div>
        </div>
    )
}
