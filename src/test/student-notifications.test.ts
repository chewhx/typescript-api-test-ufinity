import {
  extractMentionedEmails,
  getStudentsForNotifications,
} from '../services/student-notifications/service';

describe('extractMentionedEmails', () => {
  it('Should be defined', () => {
    expect(extractMentionedEmails).toBeDefined();
  });

  it('Should return emails withint the string without "@" symbol', () => {
    const message =
      'Hello students! @studentalexandro@gmail.com @studentjuana@gmail.com';

    const res = extractMentionedEmails(message);

    const expected: string[] = [
      'studentalexandro@gmail.com',
      'studentjuana@gmail.com',
    ];

    expect(res).toMatchObject(expected);
  });

  it('Should return empty array for no emails mentioned', () => {
    const message = 'Hello students! @studentalexandrogmail.com';

    const res = extractMentionedEmails(message);

    const expected: string[] = [];

    expect(res).toMatchObject(expected);
  });
});

describe('getStudentsForNotifications', () => {
  it('Should be defined', () => {
    expect(getStudentsForNotifications).toBeDefined();
  });

  it('Should return students for a teacher without student mentions', async () => {
    const teacher = 'teacherken@gmail.com';
    const notification = 'Hello students!';

    const teacherModel: any = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        email: 'teacherken@gmail.com',
        Students: [{ id: 1, email: 'studentkendall@gmail.com' }],
      }),
    };

    const studentModel: any = {
      findAll: jest.fn().mockResolvedValue(
        extractMentionedEmails(notification).map((e) => ({
          id: e + 1,
          email: e,
        }))
      ),
    };

    const expected = ['studentkendall@gmail.com'];

    const res = await getStudentsForNotifications({
      teacher,
      notification,
      teacherModel,
      studentModel,
    });

    expect(res).toMatchObject(expected);
  });

  it('Should return students for a teacher with student mentions', async () => {
    const teacher = 'teacherken@gmail.com';
    const students = ['studentalexandro@gmail.com', 'studentjuana@gmail.com'];
    const notification = `Hello students! @${students.join(' @')}`;

    const teacherModel: any = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        email: 'teacherken@gmail.com',
        Students: [{ id: 1, email: 'studentkendall@gmail.com' }],
      }),
    };

    const studentModel: any = {
      findAll: jest.fn().mockResolvedValue(
        students.map((e) => ({
          id: e + 1,
          email: e,
        }))
      ),
    };

    const expected = [
      'studentkendall@gmail.com',
      'studentalexandro@gmail.com',
      'studentjuana@gmail.com',
    ];

    const res = await getStudentsForNotifications({
      teacher,
      notification,
      teacherModel,
      studentModel,
    });

    expect(res).toMatchObject(expected);
  });
});
