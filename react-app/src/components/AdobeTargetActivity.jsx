import React, { useEffect } from 'react';
var alloyLibrary = require('@adobe/alloy');

var alloy = alloyLibrary.createInstance({ name: 'alloy' });


alloy('configure', {
  'edgeConfigId': '4ebed2da-abdb-4649-bbc5-9de3cc24a60d', // AEP Datastream ID
  'orgId':'8CAB1E54661E40C70A495C16@AdobeOrg',
  'debugEnabled': true,
});

export default function AdobeTargetActivity({ activityLocation, OfferComponent }) {
  const [offer, setOffer] = React.useState();

  useEffect(() => {
    async function sendAlloyEvent() {
      // Get the activity offer from Adobe Target
      const result = await alloy('sendEvent', {
        // decisionScopes is set to an array containing the Adobe Target activity location
        'decisionScopes': [activityLocation],
      });

      if (result.propositions?.length > 0) {
        // Find the first proposition for the active activity location
        var proposition = result.propositions?.filter((proposition) => { return proposition.scope === activityLocation; })[0];

        // Get the Content Fragment Offer JSON from the Adobe Target response
        const contentFragmentOffer = proposition?.items[0]?.data?.content || { status: 'error', message: 'Personalized content unavailable'};

        if (contentFragmentOffer?.data) {
          // Content Fragment Offers represent a single Content Fragment, hydrated by
          // the byPath GraphQL query, we must traverse the JSON object to retrieve the
          // Content Fragment JSON representation
          const byPath = Object.keys(contentFragmentOffer.data)[0];
          const item = contentFragmentOffer.data[byPath]?.item;

          if (item) {
            // Set the offer to the React state so it can be rendered
            setOffer(item);

            // Record the Content Fragment Offer as displayed for Adobe Target Activity reporting
            // If this request is omitted, the Target Activity's Reports will be blank
            alloy("sendEvent", {
                xdm: {
                    eventType: "decisioning.propositionDisplay",
                    _experience: {
                        decisioning: {
                            propositions: [proposition]
                        }
                    }
                }
            });
          }
        }
      }
    };

    sendAlloyEvent();

  }, [activityLocation, OfferComponent]);

  if (!offer) {
    // Adobe Target offer initializing; we render a blank component (which has a fixed height) to prevent a layout shift
    return (<OfferComponent></OfferComponent>);
  } else if (offer.status === 'error') {
    // If Personalized content could not be retrieved either show nothing, or optionally default content.
    console.error(offer.message);
    return (<></>);
  }

  console.log('Activity Location', activityLocation);
  console.log('Content Fragment Offer', offer);

  // Render the React component with the offer's JSON
  return (<OfferComponent content={offer} />);
};
