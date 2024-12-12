// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId, courseData } = req.body;
    console.log('1111', req.body);
    try {
        // Update the user's course information
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                course: {
                    name: courseData.name,
                    professor: courseData.professor,
                    location: courseData.location,
                },
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update course information', error });
    }
}
