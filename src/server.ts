import App from './app';
import 'dotenv/config';
import {
	CertificateController,
	CoursesController, LessonsController, MessagesController,
	PagesController, PaymentsController, StudyProgressController, UsersController
} from './controllers';


const app = new App(
	[
		new PaymentsController(),
		new UsersController(),
		new CoursesController(),
		new LessonsController(),
		new MessagesController(),
		new PagesController(),
		new StudyProgressController(),
		new CertificateController()
	],
	+process.env.PORT,
	'/v1'
);
app.listen();
