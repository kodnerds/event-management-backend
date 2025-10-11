import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const successResponse = (
    res:Response,
    statusCode:StatusCodes,
    message:string,
    data?:unknown
) => res.status(statusCode).json({success:true,message,data});

export const errorResponse = (
    res:Response,
    statusCode:StatusCodes,
    message:string
) => res.status(statusCode).json({success:true, message})