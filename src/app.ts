import * as express from 'express';
import { ApiHelperService } from './request-helper';
export default class App {
	public app: express.Application;
	public _http: ApiHelperService = new ApiHelperService(process.env.BACKEND_URL);
	public port: number
	public version: string;
	public host: string;

	constructor(port: number, version: string) {
		this.app = express();
		this.port = port || 5000;
		this.version = version;
	}


	public listen() {
		this.app.get('/', function (req, res) {
			res.send('hello world')
		})
		this.app.listen(this.port, () => {
			console.log(`App running on http://${process.env.API_URL}:${this.port}`);
			require('./telegram-bot');
			setInterval(() => {
				this._http.pushBot()
					.then(() => console.log('push bot'))
					.catch((e) => console.log(e));
			}, 20 * 60 * 1000);
		});
	}
}
