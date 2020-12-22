import axios from 'axios';
import { Course, CustomMessage, Lesson, User } from 'interfaces';

export class ApiHelperService {
    private _apiUrl = process.env.BACKEND_URL;
    constructor(link?: string) {
        this._apiUrl = link;
    }

    public updateUser(data: Partial<User>): Promise<any> {
        return axios.patch(`${this._apiUrl}/users/current`, data)
    }
    public getUser(chat_id: User['chat_id']): Promise<User> {
        return axios.get(`${this._apiUrl}/users/user`, { params: { chat_id } }).then(response => response.data.result)
    }

    public courseList(): Promise<Course[]> {
        return axios.get(`${this._apiUrl}/courses`).then(response => response.data.result)
    }
    public lessonList(params: Partial<Lesson>): Promise<Lesson[]> {
        return axios.get(`${this._apiUrl}/lessons`, { params }).then(response => response.data.result);
    }
    public lessonDetail(id: Lesson['id'], chat_id: User['chat_id']): Promise<Lesson> {
        return axios.get(`${this._apiUrl}/lessons/${id}`, { params: { chat_id } }).then(response => response.data.result);
    }
    public sendMessage(body: CustomMessage): Promise<CustomMessage> {
        return axios.post(`${this._apiUrl}/messages`, body).then(response => response.data.result)
    }


}