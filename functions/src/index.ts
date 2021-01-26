import * as functions from "firebase-functions";
import createNewUser from "./create-new-user";

exports.addNewUser = functions.auth.user().onCreate(createNewUser);
