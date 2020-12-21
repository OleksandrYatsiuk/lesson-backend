export class BaseConfig {
    public phoneRegexExp = '^[\\d]{5,15}$';
    public passwordRegexExp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})";
    public minPaginationPage = 1;
    public defaultPaginationPage = 1;
    public defaultPaginationPerPage = 20;
}