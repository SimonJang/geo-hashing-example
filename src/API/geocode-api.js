"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const got = require("got");
const mem = require("mem");
const throttle = require("p-throttle");
const loadJSON = require("load-json-file");
const countryMap = new Map([
    ['belgium', 'BE']
]);
const memGetKey = mem(() => loadJSON.sync(path.join(__dirname, '..', '..', 'config.json')).key, { maxAge: 3.6e+6 });
const getGeoData = throttle(async (address) => {
    const key = memGetKey();
    const component = 'country:BE';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}$components=${component}&key=${key}`;
    const response = await got.post(url);
    const body = JSON.parse(response.body);
    if (!body.results && !body.results[0] && !body.results[0].geometry) {
        return null;
    }
    try {
        return body.results[0].geometry.location;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}, 3, 1000);
const parseAddress = ({ street, number, city, zip, country }) => {
    const streetTokens = street.split(' ');
    const streetNumber = streetTokens.pop();
    const streetWithoutNumber = streetTokens.join('+');
    const cityTokens = city.split(' ').join('+');
    return `${streetNumber}+${streetWithoutNumber},${cityTokens},${zip},${countryMap.get(country)}`;
};
exports.getGeoDataForAddress = async ({ address }) => {
    const parsedAddress = parseAddress(address);
    return getGeoData(parsedAddress);
};
