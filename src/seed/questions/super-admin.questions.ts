import { Question, QuestionSet } from 'nest-commander';

@QuestionSet({ name: 'superadmin-questions' })
export class SuperAdminQuestions {
  @Question({
    message: 'Please provide name',
    name: 'name',
  })
  parseName(val: string) {
    return val;
  }

  @Question({
    message: 'Please provide email address',
    name: 'email',
  })
  parseEmail(val: string) {
    return val;
  }

  @Question({
    message: 'Please provide password',
    name: 'password',
  })
  parsePassword(val: string) {
    return val;
  }
}
