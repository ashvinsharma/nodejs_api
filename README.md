# Node.js Task
A microservice built in node.js express for SocialCops.It offers three different functionalities 
1. Token creation (Public)
2. JSON Patching (Protected)
3. Image Thumbnail Generation (Protected)

Out of these, only the first service can be used without any authentication. Rest two services need a token(signed by using HMAC + SHA256 algorithm) generated from the first service.

*__NOTE__: Request to all these services are sent using `POST` request and `x-www-form-url-encoded` type.*

# Getting started with the service
1. Install node.js version `8.x` from https://nodejs.org/en/download/ and Postman from https://www.getpostman.com/
2. Clone the repository using `git clone -b master https://github.com/ashvinsharma/nodejs_api.git`.
3. Install all the necessary libraries using the command `npm install`.
4. For security reasons file with details of database is not commited on git. So create a file `.env` in the root folder with the following contents,
```
SECRET_KEY=mysecretkey
DB_URL=mongodb://<username>:<password>@<db_url>:<db_port>/<db_name>
```
5. Run `npm start` to start the project.
6. Run Postman to send the requests or simply run `npm test` to initiate the test.
7. For Javascript styling and linting run `npm run lint` to execute eslint on all `.js` files in the project. 
