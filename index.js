'use strict';

$(function() {
  console.log('App loaded! Waiting for submit!');
  watchForm();
});
/********Setting up parameters*************/
function getParks(query, maxResults) {
    const params = {
        limit: maxResults,
        stateCode: query,
        fields: 'addresses',
        api_key: apiKey
    }
/******Fetch information, if there's an error display a message**************************/

    const queryString = formatQueryParams(params);
    const url = `${baseUrl}?${queryString}`;
    //creates url string 
  
    
    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Uh oh..Something went wrong: ${err.message}`);
    });
}

    
/************ Contains info to fetch info*********/
const baseUrl = 'https://developer.nps.gov/api/v1/parks';
const apiKey = 'cAfRzb7sd5mWYMNcfMYCZalA8dXF2hBhBC6yU3Ga';
// After assignment has been checked, I will remove my API key from this repo//
// Insert your own NPS API key for the value of apiKey.



function formatQueryParams(params) {
    const stateCode = params.stateCode.split(/[ ,!."';:-]+/).join(',');
    params.stateCode = stateCode;
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}
// function for query parameters

/******************Function for addresses********/

function getAddress(array) {
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].type === 'Physical') {
            return array[i];
        }
    }
}

function getStreetAddress(response, index) {
    const addressArray = response.data[index].addresses;
    return getAddress(addressArray);
}

// function to get addresses 


function formatAddress(response, index) {
    const physAddressObj = getStreetAddress(response, index);
    const addressLines = format(physAddressObj);
    return `
    ${addressLines}
    ${physAddressObj.city}, ${physAddressObj.stateCode} ${physAddressObj.postalCode}
    `;
}

// function to display addresses 

function format(obj) {
    let result = ``;
    if (obj.line1) {
        result += `${obj.line1}<br>`;
    }
    if (obj.line2) {
        result += `${obj.line2}<br>`;
    }
    return result;
}
// function to format address lines

/**********Function to display results ********/

function displayResults(responseJson) {
    console.log(responseJson);
    $('.js-results').empty();
     // Clears previous results
    for (let i = 0; i < responseJson.data.length; i++) {
        //iterates through the items array
        $('.js-results').append(`
        <li><h2>${responseJson.data[i].fullName}</h2></li>
        <li><p>${responseJson.data[i].description}</p></li>
        <li><h3>Address</h3></li>
        <li><p>${formatAddress(responseJson, i)}</p></li>
        <li><a href="${responseJson.data[i].url}">Click here for ${responseJson.data[i].fullName} website</a></li>
        `);
        $('#results').removeClass('hidden');
        //lists the national park's name, description, address and website url
    }
}

// Watch search form for submit, call getParks function
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchText = $('#search-text').val();
        const maxResults = $('#max-results').val() - 1;
        getParks(searchText, maxResults);
    });
}

