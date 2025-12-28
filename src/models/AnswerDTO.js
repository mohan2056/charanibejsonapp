export class AnswerDTO {
  constructor(data = {}) {
    this.questionId = data.questionId || null;
    this.selectedOption = data.selectedOption || '';
  }
}
