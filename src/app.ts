import * as express from 'express';
export default class App {
	public app: express.Application;
	public port: number
	public version: string;
	public host: string;

	constructor(port: number, version: string) {
		this.app = express();
		this.port = port || 5000;
		this.version = version;
	}


	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App running on http://${process.env.API_URL}:${this.port}`);
		});
	}
}
