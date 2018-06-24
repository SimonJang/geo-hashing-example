import * as fs from 'fs';
import * as path from 'path';
import * as loadJSON from 'load-json-file';
import {getGeoDataForAddress} from './src/API/geocode-api';

(async () => {
	const data = loadJSON.sync(path.join(__dirname, 'data', 'pharmacies.json'));
	const pharmaciesEnriched = {};

	for (const key of Object.keys(data)) {
		const result = await getGeoDataForAddress(data[key]);
		console.log('result from API logic', JSON.stringify(result, null, '\t'));

		pharmaciesEnriched[key] = {
			...data[key],
			location: result
		};
	}

	fs.writeFileSync(path.join(__dirname, 'processed', 'pharmaciesv2.json'), JSON.stringify(pharmaciesEnriched, null, '\t'));
})();
