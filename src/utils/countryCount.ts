import UserModel, { User } from '../models/user';
import { google } from 'googleapis';

export const countryCount = async () => {
  const mongoDBUsers: User[] = await UserModel.find();
  const paidUsers: User[] = mongoDBUsers.filter((user) => {
    return user.step === 'TEST';
  });
  const paidUserLeader: User[] = paidUsers.filter((user) => {
    return user.role === 'TEAM_LEADER';
  });
  const countMap: Map<string, number> = new Map();
  // countries.map((country) => {
  //   country.states.map((state) => {
  //     state.cities.map((city) => {
  //       countMap.set(city, 0);
  //     });
  //   });
  // });

  mongoDBUsers.map((user) => {
    if (!countMap.has(user.city)) {
      countMap.set(user.city, 0);
    }
  });
  paidUserLeader.map((user) => {
    countMap.set(user.city, countMap.get(user.city) + 1);
  });
  // console.log(countMap);

  const updateSheet = async (countMap: Map<string, number>) => {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: 'account.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
      const client = await auth.getClient();
      const sheets = await google.sheets({ version: 'v4', auth: client });
      const sheetId: string = '1aXazOozjhwNOJCBHkYY2krhILBMng31i66XT7mk_AVU';

      const Temp = new Array();
      Temp.push(['city', 'count']);
      countMap.forEach((key, value) => {
        const temp = new Array();

        if (value !== '') {
          temp.push(value, key);
          Temp.push(temp);
        }
      });
      await sheets.spreadsheets.values.clear({
        auth: auth,
        spreadsheetId: sheetId,
        range: 'Sheet1!A:B',
      });
      await sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: sheetId,
        range: 'Sheet1!A:B',
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

  updateSheet(countMap);
};
