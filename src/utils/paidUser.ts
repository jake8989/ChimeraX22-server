import UserModel, { User } from '../models/user';
import { google } from 'googleapis';

export const paidUsers = async () => {
  const mongoDBUsers: User[] = await UserModel.find();
  const paidUsers: User[] = mongoDBUsers.filter((user) => {
    return user.step === 'TEST';
  });
  const paidUserLeader: User[] = paidUsers.filter((user) => {
    return user.role === 'TEAM_LEADER';
  });

  // console.log(paidUserLeader);
  const updateSheet = async (paidUserLeader: User[]) => {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: 'account.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
      const client = await auth.getClient();
      const sheets = await google.sheets({ version: 'v4', auth: client });
      const sheetId: string = '1FyUOnvCyjk720wPpWMDMO1dMz8wjypivR8MKtcIEdrU';

      const Temp = new Array();
      Temp.push(['name', 'email', 'city', 'college', 'phone']);
      paidUserLeader.map((user) => {
        const temp = new Array();
        temp.push(user.name, user.email, user.city, user.college, user.phone);
        Temp.push(temp);
      });
      // console.log(Temp);
      await sheets.spreadsheets.values.clear({
        auth: auth,
        spreadsheetId: sheetId,
        range: 'A:E',
      });
      await sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: sheetId,
        range: 'A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: Temp,
        },
      });
      return;
    } catch (error) {
      console.log(error);
    }
  };

  updateSheet(paidUserLeader);
};
