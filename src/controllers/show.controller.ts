import { ShowRepository } from "../repositories"
import { HTTP_STATUS } from "../utils/const";
import logger from "../utils/logger";

import type { ExtendedRequest } from "../types";
import type {Response } from 'express';

export const createShow = async(req:ExtendedRequest,res:Response) => {
    try {
        const {title,description,location,date,ticketPrice,availableTickets} = req.body 

        const user = req.user

        if (!user?.id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({message: "Unauthorized access"})
        }

        const showDate = new Date(date);

        if (isNaN(showDate.getTime())) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({message: "Invalid date format"})
        }

        if (showDate < new Date) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({message: "Show date cannot be in the past"})
        }

        if (ticketPrice < 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({message: "Ticket price must be positive"})
        }

        if (availableTickets < 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({message: "Available price must be positive"})
        }

        const showRepository = new ShowRepository();

        const existingShow = await showRepository.findOne({
            where: {title, artist: { id: user.id }},
            select: ['id']
        });

        if (existingShow) {
            return res.status(HTTP_STATUS.CONFLICT).json({message: 'A show with this title already exists'});
        }

        const newShow = await showRepository.create({
            title,description,location,date:showDate,ticketPrice:ticketPrice ?? 0,availableTickets:availableTickets ?? null
        });

        return res.status(HTTP_STATUS.CREATED).json({
            message: 'Show created successfully',
            data:{
                id: newShow.id,
                title: newShow.title,
                location: newShow.location,
                date: newShow.date,
                ticketPrice:newShow!.ticketPrice,
                availableTickets: newShow!.availableTickets,
                artistId: user.id,
            }
        })
    } catch (error) {
        logger.error('Error creating show',error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: `Server error: ${error}`})
    }
}