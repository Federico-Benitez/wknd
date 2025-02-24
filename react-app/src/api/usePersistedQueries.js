/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { useEffect, useState } from "react";
import aemHeadlessClient from "./aemHeadlessClient";

// environment variable for configuring the headless client
const { DISABLE_CACHE, VITE_APP_GRAPHQL_ENDPOINT} = import.meta.env;

/**
 * This file contains the React useEffect custom hooks that:
 * 1. Are called by the React components
 * 2. To get data from AEM GraphQL persisted queries
 *
 * Each custom hook maps to a persisted query and is responsible for:
 * 1. Calling the AEM persisted query
 * 2. Collecting and transforming the returned data into the format expected by the React view components
 * 3. Setting and returning any error state
 */

/**
 * Private, shared function that invokes the AEM Headless client.
 * 
 * @param {String} persistedQueryName the fully qualified name of the persisted query
 * @param {*} queryParameters an optional JavaScript object containing query parameters
 * @returns the GraphQL data or an error message 
 */
async function fetchPersistedQuery(persistedQueryName, queryParameters) {
  let data;
  let err;

  // Do NOT disable cache in production. This toggle is this demo app is only to help you quickly explore AEM's Headless APIs without having to wait for cache expiration to see changes.
  if (DISABLE_CACHE === "true") {
    if (queryParameters === "undefined") {
      queryParameters = {};
    }
    queryParameters.timestamp = new Date().getTime();
  }

  try {
    // AEM GraphQL queries are asynchronous, either await their return or use Promise-based .then(..) { ... } syntax
    const response = await aemHeadlessClient.runPersistedQuery(
      persistedQueryName,
      queryParameters
    );
    // The GraphQL data is stored on the response's data field
    data = response?.data;
  } catch (e) {
    // An error occurred, return the error messages
    err = e
      .toJSON()
      ?.map((error) => error.message)
      ?.join(", ");
    console.error(e.toJSON());
  }

  return { data, err };
}

/**
 * React custom hook that returns a list of adventures by activity. If no activity is provided, all adventures are returned.
 * 
 * Custom hook that calls the '[graphql endpoint namespace]/adventures-all' or '[graphql endpoint namespace]/adventures-by-activity' persisted query.
 *
 * @returns an array of Adventure JSON objects, and array of errors
 */
export function useAdventuresByActivity(adventureActivity, params) {
  const [adventures, setAdventures] = useState(null);
  const [errors, setErrors] = useState(null);

  // Use React useEffect to manage state changes
  useEffect(() => {
    async function fetchData() {

      let queryVariables = params;
      let response;

      // if an activity is set (i.e "Camping", "Hiking"...) call [graphql endpoint namespace]/adventures-by-activity query
      if (adventureActivity) {
        // The key is 'activity' as defined in the persisted query
        queryVariables = { ...queryVariables, activity: adventureActivity };

        // Call the AEM GraphQL persisted query named "[graphql endpoint namespace]/adventures-by-activity" with parameters
        response = await fetchPersistedQuery(VITE_APP_GRAPHQL_ENDPOINT + "/adventures-by-activity", queryVariables);
      } else {
        // Call the AEM GraphQL persisted query named "[graphql endpoint namespace]/adventures-all"
        response = await fetchPersistedQuery(VITE_APP_GRAPHQL_ENDPOINT + "/adventures-all", queryVariables);
      }

      // Sets the adventures variable to the list of adventure JSON objects
      setAdventures(response.data?.adventureList?.items);

      // Set any errors
      setErrors(response.err);
    }
    // Call the internal fetchData() as per React best practices
    fetchData();

  }, [adventureActivity, params]);

  // Returns the adventures and errors
  return { adventures, errors };
}

/**
 * Calls the '[graphql endpoint namespace]/adventure-by-slug' persisted query with `slug` parameter.
 *
 * @param {String!} slugName the adventure slug
 * @returns a JSON object representing the Adventure
 */
export function useAdventureBySlug(slugName, params) {
  const [adventure, setAdventure] = useState(null);
  const [references, setReferences] = useState(null);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    async function fetchData() {

      let response;

      // The key is 'slug' as defined in the persisted query
      const queryVariables = { 
        ...params,
        slug: slugName,
      };

      // Call the AEM GraphQL persisted query named "[graphql endpoint namespace]/adventure-by-slug" with parameters
      response = await fetchPersistedQuery(
        VITE_APP_GRAPHQL_ENDPOINT + "/adventure-by-slug",
        queryVariables
      );

      if (response.err) {
        // Capture errors from the HTTP request
        setErrors(response.err);
      } else if (response.data?.adventureList?.items?.length === 1) {
        // Set the Adventure data after data validation
        setAdventure(response.data.adventureList.items[0]);
        setReferences(response.data.adventureList._references);
      } else {
        // Set an error if no Adventure could be found
        setErrors(`Cannot find Adventure with slug: ${slugName}`);
      }

    }

    // Call the internal fetchData() as per React best practices
    fetchData();

  }, [slugName, params]);

  return { adventure, references, errors };
}


