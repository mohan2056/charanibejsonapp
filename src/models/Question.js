export class Question {
  constructor(data = {}) {
    this.id = data.id || null;
    this.section = data.section || '';
    this.question = data.question || '';
    this.optionA = data.optionA || '';
    this.optionB = data.optionB || '';
    this.optionC = data.optionC || '';
    this.optionD = data.optionD || '';
    this.correctOption = data.correctOption || '';
  }
}
