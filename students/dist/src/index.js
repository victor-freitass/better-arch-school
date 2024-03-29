"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const routes_1 = __importDefault(require("./routes"));
const pgConnection_1 = __importDefault(require("./config/database/pgConnection"));
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../config/doc/swagger.json"));
const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_PORT, MONGO_NAME } = process.env;
class App {
    constructor() {
        this.express = (0, express_1.default)();
        this.middlewares();
        this.routes();
        this.connection();
    }
    middlewares() {
        this.express.use(express_1.default.json());
        this.express.use("/api-documentation", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
    }
    routes() {
        this.express.use(routes_1.default);
    }
    connection() {
        return __awaiter(this, void 0, void 0, function* () {
            mongoose_1.default.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_NAME}?authSource=admin`)
                .then(_ => {
                console.log('Connected to MongoDB');
                pgConnection_1.default.connect().then(_ => {
                    console.log('Connected to Postgres');
                    this.express.listen(process.env.PORT_STUDENTS, () => console.log('Student API on...'));
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        });
    }
}
new App();
