import UserModel, { User } from '../models/user';
import { google } from 'googleapis';

export const totalUsers = async () => {
  const mongoDBUsers: User[] = await UserModel.find();

  // console.log(paidUserLeader);
  const updateSheet = async (mongoDBUsers: User[]) => {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: 'account.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
      const client = await auth.getClient();
      const sheets = await google.sheets({ version: 'v4', auth: client });
      const sheetId: string = '129mDe0nkmfTQ_5YJxtdfgmr81RXIqLI9qITDvCY_Tvw';

      const Temp = new Array();
      Temp.push(['name', 'email', 'city', 'college', 'phone', 'role', 'step']);
      mongoDBUsers.map((user) => {
        const temp = new Array();
        temp.push(
          user.name,
          user.email,
          user.city,
          user.college,
          user.phone,
          user.role,
          user.step
        );
        Temp.push(temp);
      });
      console.log(Temp);
      await sheets.spreadsheets.values.clear({
        auth: auth,
        spreadsheetId: sheetId,
        range: 'Sheet1!A:G',
      });
      await sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: sheetId,
        range: 'Sheet1!A:G',
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

  updateSheet(mongoDBUsers);
};
