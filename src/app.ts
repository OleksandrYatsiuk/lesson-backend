import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { Controller } from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';
import { NotFoundException } from './exceptions';
const swaggerDocument = require('./swagger/swagger.json');
import * as swaggerUi from 'swagger-ui-express';
export default class App {
	public app: express.Application;
	public port: number
	public version: string;
	public host: string;
	public hostDb = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@plc.eqrk2.mongodb.net/${process.env.DB_NAME}`

	constructor(controllers: Controller[], port: number, version: string) {
		this.app = express();
		this.port = port || 5000;
		this.version = version;
		this.connectToTheDatabase();
		this.setBodyParser();
		this.setCors();
		this.initializeControllers(controllers);
		this.initializeErrorHandling();
	}
	/**
	* Headers (CORS)
	*/
	public setCors() {
		this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			res.header('Access-Control-Allow-Origin', '*');
			if (req.method == 'OPTIONS') {
				res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
				res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
				return res.status(200).json({});
			}
			next();
		});
	}

	public setBodyParser() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}

	

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App running on http://${process.env.API_URL}:${this.port}`);
		});
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}

	private initializeControllers(controllers: Controller[]) {
		controllers.forEach((controller) => {
			this.app.use(`/api${this.version}`, controller.router)
		})
		this.setSwagger();

		this.app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
			next(new NotFoundException('Method'));
		});
	}

	private setSwagger() {
		this.app.use(express.static('src/swagger'));
		this.app.use('/rest', (req: express.Request, res: express.Response) => res.send(swaggerDocument));
		const options = {
			swaggerOptions: {
				urls: [{
					url: `http://localhost:5000/rest`,
					name: 'Local'
				}]
			}
		};
		this.app.use('/', (req, res, next) => {
			swaggerDocument.host = req.get('host');
			req['swaggerDoc'] = swaggerDocument;
			next();
		},
			swaggerUi.serve,
			swaggerUi.setup(null, options)
		);
	}

	private connectToTheDatabase() {
		mongoose
			.connect(this.hostDb, {
				useNewUrlParser: true,
				useCreateIndex: true,
				useUnifiedTopology: true,
				useFindAndModify: false
			})
			.then(() => console.info('MongoDB connected successfully!'))
			.catch((error) => console.error(`MongoDB error:\n ${error}`));
	}
}
