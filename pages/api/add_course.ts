// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log('Request received:', req.method);
    console.log('Request body:', req.body);

    const { userId, courseData } = req.body;
    console.log('Extracted data:', { userId, courseData });
    
    if (!userId || !courseData) {
        console.log('Validation failed:', { userId, courseData });
        return res.status(400).json({ message: 'Missing required data' });
    }

    try {
        console.log('Attempting to update user:', userId);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                course: {
                    create: {
                        name: courseData.name,
                        professor: courseData.professor,
                        location: courseData.location,
                    }
                }
            },
            include: {
                course: true
            }
        });
        console.log('Update successful:', updatedUser);

        res.status(200).json(updatedUser.course);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Failed to update course information', error });
    }
}
