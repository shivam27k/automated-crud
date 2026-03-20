import type { Request, Router } from "express";
import type { Model } from "mongoose";

export type CrudHook = (req: Request, body?: any) => any | Promise<any>;

export type CustomRouteHandler<T = any> = (context: {
    req: Request;
    params: Record<string, string>;
    query: Record<string, any>;
    body: any;
    model: Model<T>;
}) => any | Promise<any>;

export type CustomRoute<T = any> = {
    method: "get" | "post" | "patch" | "put" | "delete";
    path: string;
    handler: CustomRouteHandler<T>;
};

export type CreateCrudRouterOptions<T = any> = {
    model: Model<T>;
    searchFields?: string[];
    allowedIncludes?: string[];
    idParam?: string;
    hooks?: {
        beforeCreate?: CrudHook;
        beforeUpdate?: CrudHook;
        beforeDelete?: (req: Request) => any | Promise<any>;
    };
    customRoutes?: CustomRoute<T>[];
};

export function createCrudRouter<T = any>(
    options: CreateCrudRouterOptions<T>
): Router;

export function crudErrorHandler(
    err: any,
    req: Request,
    res: any,
    next: any
): any;
