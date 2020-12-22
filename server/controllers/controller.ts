import { Router, RequestHandler } from "express";

import { UserType } from "../entities/user";
import { authenticate } from "../middlewares/authenticate";
import { handleErrors } from "../middlewares/handleErrors";

// todo: Add user type. and authenticate

export class Controller {
  public router: Router;
  public name: string;

  constructor(name: string) {
    this.router = Router({ mergeParams: true });
    this.name = name;
  }

  public get(path: string, handler: RequestHandler): void {
    this.router.get(path, handleErrors(handler));
  }

  public getSecure(path: string, handler: RequestHandler): void {
    this.router.get(path, handleErrors(authenticate(UserType.PLMO_ADMIN)), handleErrors(handler));
  }

  public post(path: string, handler: RequestHandler): void {
    this.router.post(path, handleErrors(handler));
  }

  public put(path: string, handler: RequestHandler): void {
    this.router.put(path, handleErrors(handler));
  }

  public delete(path: string, handler: RequestHandler): void {
    this.router.delete(path, handleErrors(handler));
  }
}
