import Razorpay from 'razorpay';
import axios from 'axios';
import UserModel, { User } from '../models/user';

const razorpayFilter = async () => {
  try {
    const data = new Array();
    for (let i = 6; i <= 23; i++) {
      const dateR = Math.floor(
        new Date(`2022-01-${i} 00:00:00.000`).getTime() / 1000
      );
      const dateL = Math.floor(
        new Date(`2022-01-${i - 1} 00:00:00.000`).getTime() / 1000
      );
      const payment = await axios.get(
        `https://${process.env.RAZORPAY_KEY}:${process.env.RAZORPAY_SECRET}@api.razorpay.com/v1/payments?from=${dateL}&to=${dateR}&count=50`
      );
      payment?.data?.items?.map((item: any) => {
        data.push(item);
      });
    }
    const successPayment = data.filter((item) => {
      return item.status === 'captured';
    });
    const mongoDBUsers: User[] = await UserModel.find();
    const paidUsers: User[] = mongoDBUsers.filter((user) => {
      return user.step === 'TEST';
    });
    const paidUserLeader: User[] = paidUsers.filter((user) => {
      return user.role === 'TEAM_LEADER';
    });
    successPayment.map((user) => {
      if (
        paidUserLeader.find((mongouser) => mongouser.paymentId === user.id) ===
        undefined
      ) {
        console.log(user.email);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export default razorpayFilter;
