import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schema/users.schema';

@Injectable()
export class UsersAnalytics {

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }


    async getOverview() {

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);


        const startOfMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
        );


        const [
            total,
            active,
            patients,
            doctors,
            admins,
            newToday,
            newThisMonth,
            averages,
        ] = await Promise.all([


            this.userModel.countDocuments(),


            this.userModel.countDocuments({
                isActive: true,
            }),


            this.userModel.countDocuments({
                role: 'patient',
            }),


            this.userModel.countDocuments({
                role: 'doctor',
            }),


            this.userModel.countDocuments({
                role: 'admin',
            }),


            this.userModel.countDocuments({
                createdAt: {
                    $gte: startOfToday,
                },
            }),


            this.userModel.countDocuments({
                createdAt: {
                    $gte: startOfMonth,
                },
            }),


            this.userModel.aggregate([
                {
                    $group: {
                        _id: null,

                        averageAge: {
                            $avg: '$age',
                        },

                        averageWeight: {
                            $avg: '$weight',
                        },
                    },
                },
            ]),


        ]);


        return {

            total,

            active,

            inactive: total - active,


            patients,
            doctors,
            admins,


            newToday,
            newThisMonth,


            averageAge:
                Number(
                    averages[0]?.averageAge?.toFixed(1) ?? 0
                ),


            averageWeight:
                Number(
                    averages[0]?.averageWeight?.toFixed(1) ?? 0
                ),

        };

    }



}
