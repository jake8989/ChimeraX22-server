import { Context } from '../index';
import UserModel, { User, Step, UserQuizStatus } from '../models/user';
import 'reflect-metadata';
import { Resolver, Query, Ctx, Authorized } from 'type-graphql';
import {
  InvitationResponse,
  TeamResponse,
  QuizDetailsResponse,
} from './registerInput';
import InvitationModel, { Status } from '../models/invitation';
import QuestionModel from '../models/questions';
import TeamModel, { TeamStatus } from '../models/team';
import invitation from '../models/invitation';
import { Question } from '../models/questions';
import user from '../models/user';

@Resolver()
export default class QueryClass {
  @Query((returns) => User)
  // @Authorized("USER")
  async viewer(@Ctx() context: Context) {
    const user = await UserModel.findOne({ email: context.user.email });
    user.id = user._id;
    user.password = '';
    return user;
  }

  @Query((returns) => InvitationResponse)
  async getInvitations(@Ctx() context: Context) {
    const sentInvitations = await InvitationModel.find({
      sendersId: context.user._id,
    });
    const receivedInvitations = await InvitationModel.find({
      receiversId: context.user._id,
    });

    return {
      sentInvitations: sentInvitations,
      receivedInvitations: receivedInvitations,
    };
  }

  // @Query((returns) => [User])
  // async getSingleUsers(@Ctx() context: Context) {
  //   const singleUsers = await UserModel.find({ step: Step.CHOOSE_TEAM });
  //   const sentInvitations = await InvitationModel.find({
  //     sendersId: context.user._id,
  //   });

  //   const filteredUsers = filter(singleUsers, (user) => {
  //     const exists = find(
  //       sentInvitations,
  //       (invitation) => invitation.receiversId === user._id.toString()
  //     );
  //     // console.log(
  //     //   context.user._id,
  //     //   user._id,
  //     //   context.user._id.toString() == user._id
  //     // );
  //     if (
  //       user._id.toString() === context.user._id.toString() ||
  //       Boolean(exists)
  //     ) {
  //       return false;
  //     }
  //     return true;
  //   });

  //   return filteredUsers;
  // }

  @Query((returns) => [Question])
  async getQuestions(@Ctx() context: Context) {
    if (context.user.step != Step.TEST) {
      throw new Error('Please complete payment to give the test');
    }
    const questions = await QuestionModel.find();

    const a = await questions.map((question) => {
      return {
        question: question.question,
        answer: '',
        questionNo: question.questionNo,
        questionType: question.questionType,
        questionAssets: question.questionAssets,
        id: question._id,
        questionAnswerType: question.questionAnswerType,
        firstAnswerLabel: question.firstAnswerLabel,
        secondAnswerLabel: question.secondAnswerLabel,
      };
    });

    // console.log(a);
    return a;
  }

  @Query((returns) => TeamResponse)
  async getTeamDetails(@Ctx() context: Context) {
    if (context.user.step != Step.PAYMENT) {
      throw new Error('Invalid Step');
    }
    const team = await TeamModel.findById(context.user.teamId);
    const leader = await UserModel.findById(team.teamLeadersId);

    if (team.teamStatus === TeamStatus.INDIVIDUAL) {
      return {
        teamLeader: {
          userId: team.teamLeadersId,
          name: leader.name,
          email: leader.email,
        },
        status: team.teamStatus,
      };
    }
    const helper = await UserModel.findById(team.teamHelpersId);

    return {
      teamLeader: {
        userId: team.teamLeadersId,
        name: leader.name,
        email: leader.email,
      },
      status: team.teamStatus,
      teamHelper: {
        userId: team.teamHelpersId,
        name: helper.name,
        email: helper.email,
      },
    };
  }

  @Query((returns) => QuizDetailsResponse)
  async getQuizDetails(@Ctx() context: Context) {
    try {
      const user = await UserModel.findById(context.user._id);

      // if (user.quizStatus != UserQuizStatus.STARTED) {
      //   throw new Error("Quiz has ended or not started");
      // }

      return {
        quizStartTime: user.quizStartTime,
        userQuizStatus: user.quizStatus,
      };
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong');
    }
  }
}
