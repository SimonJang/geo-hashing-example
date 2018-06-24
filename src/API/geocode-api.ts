import * as path from 'path';
import * as got from 'got';
import * as mem from 'mem';
import * as throttle from 'p-throttle';
import * as loadJSON from 'load-json-file';

const countryMap = new Map<string, string>([
	['belgium', 'BE']
]);

const memGetKey = mem(() => loadJSON.sync(path.join(__dirname, '..', '..', 'config.json')).key, {maxAge: 3.6e+6});

const getGeoData = throttle(async (address: string) => {
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
	} catch (err) {
		console.log(err);

		return null;
	}

	// return body.results[0].geometry.location;
}, 40, 1000);

const parseAddress = ({street, number, city, zip, country}) => {
	const streetTokens = street.split(' ');
	const streetNumber = streetTokens.pop();
	const streetWithoutNumber = streetTokens.join('+');

	const cityTokens = city.split(' ').join('+');

	return `${streetNumber}+${streetWithoutNumber},${cityTokens},${zip},${countryMap.get(country)}`;
};

export const getGeoDataForAddress = async ({address}) => {
	const parsedAddress = parseAddress(address);

	return getGeoData(parsedAddress);
};
