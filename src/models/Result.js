export class Result {
  constructor(data = {}) {
    this.id = data.id || null;
    this.candidateEmail = data.candidateEmail || '';
    this.aptitudeCorrect = data.aptitudeCorrect || 0;
    this.reasoningCorrect = data.reasoningCorrect || 0;
    this.communicationCorrect = data.communicationCorrect || 0;
    this.totalCorrect = data.totalCorrect || 0;
    this.percentage = data.percentage || 0;
  }
}
