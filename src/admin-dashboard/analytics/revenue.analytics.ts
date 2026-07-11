import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Subscription,
  SubscriptionDocument,
} from 'src/user-subscription/schema/user-subscription.schema';


@Injectable()
export class RevenueAnalytics {


  constructor(

    @InjectModel(Subscription.name)
    private readonly subscriptionModel:
      Model<SubscriptionDocument>,

  ) {}



  async getOverview() {


    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );



    const [
      totalRevenue,
      monthlyRevenue,
      revenueByPlan,
    ] = await Promise.all([



      this.subscriptionModel.aggregate([

        {
          $lookup:{
            from:'subscriptionplans',
            localField:'plan',
            foreignField:'_id',
            as:'plan'
          }
        },

        {
          $unwind:'$plan'
        },


        {
          $group:{
            _id:null,

            revenue:{
              $sum:'$plan.price'
            }
          }
        }

      ]),





      this.subscriptionModel.aggregate([


        {
          $match:{
            createdAt:{
              $gte:startOfMonth
            }
          }
        },


        {
          $lookup:{
            from:'subscriptionplans',
            localField:'plan',
            foreignField:'_id',
            as:'plan'
          }
        },


        {
          $unwind:'$plan'
        },


        {
          $group:{
            _id:null,

            revenue:{
              $sum:'$plan.price'
            }
          }
        }


      ]),





      this.subscriptionModel.aggregate([


        {
          $lookup:{
            from:'subscriptionplans',
            localField:'plan',
            foreignField:'_id',
            as:'plan'
          }
        },


        {
          $unwind:'$plan'
        },


        {
          $group:{

            _id:'$plan.name',

            revenue:{
              $sum:'$plan.price'
            },

            subscribers:{
              $sum:1
            }

          }

        },


        {
          $project:{

            _id:0,

            plan:'$_id',

            revenue:1,

            subscribers:1

          }
        },


        {
          $sort:{
            revenue:-1
          }
        }


      ])

    ]);



    return {

      totalRevenue:
        totalRevenue[0]?.revenue ?? 0,


      monthlyRevenue:
        monthlyRevenue[0]?.revenue ?? 0,


      revenueByPlan,


    };

  }

}