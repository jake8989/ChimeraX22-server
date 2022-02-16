import { google } from 'googleapis';
import TeamModel, { Team } from '../models/team';
import UserModel, { User } from '../models/user';

export const filter = async () => {
  const mongoDbTeam: Team[] = await TeamModel.find({
    quizStatus: 'SUBMITTED',
  });

  const mongoDBUsers: User[] = await UserModel.find();

  const Temp = new Array();
  Temp.push([
    'Teamname',
    'TeamLeaderName',
    'TeamHelperName',
    'TeamLeaderEmail',
    'TeamHelperEmail',
    'TeamLeaderPhone',
    'TeamHelperPhone',
    'City',
    'TeamLeaderCollege',
    'TeamHelperCollege',
    'Score',
    'QuizStart',
    'QuizEnd',
  ]);

  mongoDbTeam.map((team) => {
    const temp = new Array();
    if (team.teamHelpersId) {
      const helper: User = mongoDBUsers.find(
        (user) => user.id === team.teamHelpersId
      );
      const leaderr: User = mongoDBUsers.find(
        (user) => user.id === team.teamLeadersId
      );
      temp.push(team.teamName);
      temp.push(leaderr.name);
      temp.push(helper.name);
      temp.push(leaderr.email);
      temp.push(helper.email);
      temp.push(leaderr.phone);
      temp.push(helper.phone);
      temp.push(leaderr.city);
      temp.push(leaderr.college);
      temp.push(helper.college);
      temp.push(team.score);
      temp.push(leaderr.quizStartTime);
      temp.push(leaderr.quizEndTime);
    } else {
      const leaderr: User = mongoDBUsers.find(
        (user) => user.id === team.teamLeadersId
      );
      temp.push(team.teamName);
      temp.push(leaderr.name);
      temp.push('');
      temp.push(leaderr.email);
      temp.push('');
      temp.push(leaderr.phone);
      temp.push('');
      temp.push(leaderr.city);
      temp.push(leaderr.college);
      temp.push('');
      temp.push(team.score);
      temp.push(leaderr.quizStartTime);
      temp.push(leaderr.quizEndTime);
    }
    Temp.push(temp);
  });

  const auth = new google.auth.GoogleAuth({
    keyFile: 'account.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  const client = await auth.getClient();
  const sheets = await google.sheets({ version: 'v4', auth: client });
  const sheetId: string = '1ZwiqrPlJEZxI9wztbufd9iIY6RMV3Kn6NS0A7ETTaoE';
  await sheets.spreadsheets.values.clear({
    auth: auth,
    spreadsheetId: sheetId,
    range: 'A:M',
  });
  await sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: sheetId,
    range: 'A:M',
    valueInputOption: 'RAW',
    requestBody: {
      values: Temp,
    },
  });
  console.log(Temp);
};
